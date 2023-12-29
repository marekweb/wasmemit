export const wasmMagicNumber = [0x00, 0x61, 0x73, 0x6d];
export const wasmModuleVersion = [0x01, 0x00, 0x00, 0x00];

export type WasmNumberTypeName = "i32" | "i64" | "f32" | "f64";
export type WasmVectorTypeName = "v128";
export type WasmRefTypeName = "funcref" | "externref";
export type WasmValueTypeName =
  | WasmNumberTypeName
  | WasmVectorTypeName
  | WasmRefTypeName;

export interface WasmFunctionType {
  params: WasmValueTypeName[];
  result?: WasmValueTypeName;
}

export type CodeByte = number | keyof typeof op;

export interface WasmModuleFunction {
  name: string;
  params: WasmValueTypeName[];
  result?: WasmValueTypeName;
  locals?: WasmLocalEntry[];
  code: CodeByte[];
  export?: boolean;
}

export type WasmLocalEntry = {
  count: number;
  type: WasmValueTypeName;
};

// WASM id numbers for each number type
export const typeIds: Record<WasmValueTypeName, number> = {
  i32: 0x7f,
  i64: 0x7e,
  f32: 0x7d,
  f64: 0x7c,
  v128: 0x7b,
  funcref: 0x70,
  externref: 0x6f,
} as const;

export const sectionTypeNumbers = {
  custom: 0,
  types: 1,
  imports: 2,
  functions: 3,
  tables: 4,
  memories: 5,
  globals: 6,
  exports: 7,
  start: 8,
  elements: 9,
  code: 10,
  data: 11,
  dataCount: 12,
} as const;

export const op = {
  unreachable: 0x00,
  nop: 0x01,
  block: 0x02,
  loop: 0x03,
  if: 0x04,
  else: 0x05,
  try: 0x06,
  catch: 0x07,
  throw: 0x08,
  rethrow: 0x09,
  end: 0x0b,
  br: 0x0c,
  brif: 0x0d,
  brtable: 0x0e,
  return: 0x0f,
  call: 0x10,
  callindirect: 0x11,
  drop: 0x1a,
  select: 0x1b,
  localget: 0x20,
  localset: 0x21,
  localtee: 0x22,
  globalget: 0x23,
  globalset: 0x24,
  i32load: 0x28,
  i64load: 0x29,
  f32load: 0x2a,
  f64load: 0x2b,
  i32load8s: 0x2c,
  i32load8u: 0x2d,
  i32load16s: 0x2e,
  i32load16u: 0x2f,
  i64load8s: 0x30,
  i64load8u: 0x31,
  i64load16s: 0x32,
  i64load16u: 0x33,
  i64load32s: 0x34,
  i64load32u: 0x35,
  i32store: 0x36,
  i64store: 0x37,
  f32store: 0x38,
  f64store: 0x39,
  i32store8: 0x3a,
  i32store16: 0x3b,
  i64store8: 0x3c,
  i64store16: 0x3d,
  i64store32: 0x3e,
  i32add: 0x6a,
  i32sub: 0x6b,
  i32mul: 0x6c,
  i64add: 0x7c,
  i64sub: 0x7d,
  i64mul: 0x7e,
  i32eqz: 0x45,
  i32eq: 0x46,
  i32ne: 0x47,
  i32lts: 0x48,
  i32ltu: 0x49,
  i32gts: 0x4a,
  i32gtu: 0x4b,
  i32les: 0x4c,
  i32leu: 0x4d,
  i32ges: 0x4e,
  i32geu: 0x4f,
  i64eqz: 0x50,
  i64eq: 0x51,
  i64ne: 0x52,
  i64lts: 0x53,
  i64ltu: 0x54,
  i64gts: 0x55,
  i64gtu: 0x56,
  i64les: 0x57,
  i64leu: 0x58,
  i64ges: 0x59,
  i64geu: 0x5a,
  f32eq: 0x5b,
  f32ne: 0x5c,
  f32lt: 0x5d,
  f32gt: 0x5e,
  f32le: 0x5f,
  f32ge: 0x60,
  f64eq: 0x61,
  f64ne: 0x62,
  f64lt: 0x63,
  f64gt: 0x64,
  f64le: 0x65,
  f64ge: 0x66,
} as const;

export const exportTypeIds = {
  func: 0,
  table: 1,
  mem: 2,
  global: 3,
} as const;

export type WasmModuleExport = {
  name: string;
  type: keyof typeof exportTypeIds;
  index: number;
};
