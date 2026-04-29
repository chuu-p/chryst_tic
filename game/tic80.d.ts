/**
 * TIC-80 API Declarations
 */

declare function btn(id: number): boolean;
declare function btnp(id: number, hold?: number, period?: number): boolean;

declare function clip(x?: number, y?: number, w?: number, h?: number): void;
declare function cls(color?: number): void;

declare function circ(
  x: number,
  y: number,
  radius: number,
  color: number,
): void;
declare function circb(
  x: number,
  y: number,
  radius: number,
  color: number,
): void;

declare function exit(): void;

declare function elli(
  x: number,
  y: number,
  a: number,
  b: number,
  color: number,
): void;
declare function ellib(
  x: number,
  y: number,
  a: number,
  b: number,
  color: number,
): void;

declare function fget(sprite_id: number, flag: number): boolean;
declare function fset(sprite_id: number, flag: number, bool: boolean): void;

declare function font(
  text: string,
  x: number,
  y: number,
  transparent?: number,
  char_width?: number,
  char_height?: number,
  fixed?: boolean,
  scale?: number,
): number;

declare function key(code?: number): boolean;
declare function keyp(code?: number, hold?: number, period?: number): boolean;

declare function line(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: number,
): void;

declare function map(
  x?: number,
  y?: number,
  w?: number,
  h?: number,
  sx?: number,
  sy?: number,
  colorkey?: number,
  scale?: number,
  remap?: (tile_x: number, tile_y: number) => [number, number, number] | number,
): void;

declare function memcpy(toaddr: number, fromaddr: number, len: number): void;
declare function memset(addr: number, val: number, len: number): void;

declare function mget(x: number, y: number): number;
declare function mset(x: number, y: number, id: number): void;

declare function mouse(): [
  number,
  number,
  boolean,
  boolean,
  boolean,
  number,
  number,
];

declare function music(
  track?: number,
  frame?: number,
  row?: number,
  loop?: boolean,
): void;

declare function peek(addr: number, bits?: number): number;
declare function peek1(bitaddr: number): number;
declare function peek2(addr2: number): number;
declare function peek4(addr4: number): number;

declare function pix(x: number, y: number, color?: number): number;

declare function pmem(index: number, val?: number): number;

declare function poke(addr: number, val: number): void;
declare function poke1(bitaddr: number, bitval: number): void;
declare function poke2(addr2: number, val2: number): void;
declare function poke4(addr4: number, val4: number): void;

declare function print(
  text: string,
  x?: number,
  y?: number,
  color?: number,
  fixed?: boolean,
  scale?: number,
  smallfont?: boolean,
): number;

declare function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
): void;
declare function rectb(
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
): void;

declare function reset(): void;

declare function sfx(
  id: number,
  note?: number | string,
  duration?: number,
  channel?: number,
  volume?: number,
  speed?: number,
): void;

declare function spr(
  id: number,
  x: number,
  y: number,
  transparent?: number | number[],
  scale?: number,
  flip?: number,
  rotate?: number,
  w?: number,
  h?: number,
): void;

declare function sync(mask?: number, bank?: number, tocart?: boolean): void;

declare function ttri(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  u1: number,
  v1: number,
  u2: number,
  v2: number,
  u3: number,
  v3: number,
  texsrc?: number,
  chromakey?: number,
  z1?: number,
  z2?: number,
  z3?: number,
): void;

declare function time(): number;
declare function trace(msg: any, color?: number): void;

declare function tri(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  color: number,
): void;
declare function trib(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  color: number,
): void;

declare function tstamp(): number;

declare function vbank(bank: number): void;
