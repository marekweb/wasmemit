import fs from "node:fs/promises";

import {
  WasmFunctionType,
  WasmLocalEntry,
  WasmModuleExport,
  WasmModuleFunction,
  WasmValueTypeName,
  exportTypeIds,
  op,
  sectionTypeNumbers,
  typeIds,
  wasmMagicNumber,
  wasmModuleVersion,
} from "./constants";
import { isEquals } from "./util";
import { emitULEB128 } from "./uleb128";

function isSameSignature(a: WasmFunctionType, b: WasmFunctionType): boolean {
  return isEquals(a.params, b.params) && a.result === b.result;
}

function emitMinimalModule(functions: WasmModuleFunction[]) {
  const functionTypes: WasmFunctionType[] = [];
  const funcsVector: number[] = [];

  for (const func of functions) {
    const foundExistingMatchingSignature = functionTypes.findIndex((t) =>
      isSameSignature(t, func),
    );
    if (foundExistingMatchingSignature === -1) {
      functionTypes.push(func);
      funcsVector.push(functionTypes.length - 1);
    } else {
      funcsVector.push(foundExistingMatchingSignature);
    }
  }

  const exports: WasmModuleExport[] = [];
  for (const [index, func] of functions.entries()) {
    if (func.export) {
      exports.push({
        name: func.name,
        type: "func",
        index,
      });
    }
  }

  return Buffer.from([
    ...wasmMagicNumber,
    ...wasmModuleVersion,

    // Types section
    ...emitSection(sectionTypeNumbers.types, [
      ...emitVectorMapped(functionTypes, emitFuncType),
    ]),

    ...emitSection(sectionTypeNumbers.functions, emitVector(funcsVector)),

    // Memory section
    5, // Section ID
    3, // Section length
    1, // Number of memory entries
    0, // Flag indicating we only use a min size
    1, // Min size in pages

    // Emit exports
    ...emitSection(
      sectionTypeNumbers.exports,
      emitVectorMapped(exports, emitExport),
    ),

    ...emitSection(
      sectionTypeNumbers.code,
      emitVectorMapped(functions, emitCodeEntry),
    ),
  ]);
}

function typeNameToId(typeName: WasmValueTypeName): number {
  return typeIds[typeName];
}

function emitFuncType(type: WasmFunctionType): number[] {
  const result = type.result ? [type.result] : [];
  return [
    0x60, // Func type
    ...emitVectorMapped(type.params, typeNameToId),
    ...emitVectorMapped(result, typeNameToId),
  ];
}

/** Emit a section with calculated length. */
function emitSection(sectionNumber: WasmSectionType, content: number[]) {
  return Buffer.from([
    sectionNumber,
    ...emitULEB128(content.length),
    ...content,
  ]);
}

function emitExport(exportItem: WasmModuleExport): number[] {
  const exportTypeId = exportTypeIds[exportItem.type];
  return [...encodeName(exportItem.name), exportTypeId, exportItem.index];
}

function emitLocalEntry(local: WasmLocalEntry): number[] {
  return [...emitULEB128(local.count), typeIds[local.type]];
}

function mapOp(opcode: number | keyof typeof op) {
  if (typeof opcode === "number") {
    return opcode;
  }
  return op[opcode];
}

function emitCodeEntry(func: WasmModuleFunction): number[] {
  const locals = func.locals ?? [];
  const code = func.code.map(mapOp);
  const codeEntryBody = [
    ...emitVectorMapped(locals, emitLocalEntry),
    ...code,
    op.end,
  ];
  return [...emitULEB128(codeEntryBody.length), ...codeEntryBody];
}

// Utilities for emitting
function emitVector(items: number[] | number[][]) {
  return [...emitULEB128(items.length), ...items.flat()];
}

function emitVectorMapped<T>(
  items: T[],
  emitItem: (item: T) => number[] | number,
) {
  return [...emitULEB128(items.length), ...items.flatMap(emitItem)];
}

function encodeName(name: string): number[] {
  const utf8Encoder = new TextEncoder();
  const encoded = utf8Encoder.encode(name);
  return [...emitULEB128(encoded.length), ...encoded];
}

async function loadJson(filename: string) {
  const body = await fs.readFile(filename, "utf-8");
  return JSON.parse(body);
}

async function main(filename: string, outputFilename = "out.wasm") {
  const moduleDefinition = await loadJson(filename);
  console.log("Compiling");
  const minimalModule = emitMinimalModule(moduleDefinition);
  await fs.writeFile(outputFilename, minimalModule);
  console.log(`Wrote to ${outputFilename}`);
}

const filepath = process.argv[2];
if (!filepath) {
  console.error("Provide a filepath to a JSON Wasm module file.");
  process.exit(1);
}
main(filepath).catch((err) => {
  console.error(err);
  process.exit(1);
});
