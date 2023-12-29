import fs from "node:fs/promises";

async function main(filepath: string) {
  console.log(`Loading ${filepath}`);
  const wasmModuleBuffer = await loadFileAsBuffer(filepath);
  const wasmModule = await WebAssembly.compile(wasmModuleBuffer);
  const wasmModuleInstance = await WebAssembly.instantiate(wasmModule);
  // Execute the exported function
  const mainFunction = await getWasmExportedFunction(
    wasmModuleInstance,
    "main",
  );
  const result = await mainFunction(40, 3);
  console.log("Result of the execution:");
  console.log(result);
}

async function getWasmExportedFunction(
  wasmModule: WebAssembly.Instance,
  exportName: string,
): Promise<Function> {
  const exportValue = await wasmModule.exports[exportName];
  if (exportValue === undefined) {
    throw new Error(`Export ${exportName} not found`);
  }
  if (typeof exportValue !== "function") {
    throw new Error(`Export ${exportName} is not function`);
  }
  return exportValue;
}

async function loadFileAsBuffer(filepath: string): Promise<Buffer> {
  return await fs.readFile(filepath);
}

const filepath = process.argv[2];
if (!filepath) {
  console.error("Please provide a filepath to a wasm file");
  process.exit(1);
}
main(filepath).catch((err) => {
  console.error(err);
  process.exit(1);
});
