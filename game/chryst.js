// @ts-check
// title:   chryst
// author:  chuu801@pm.me
// desc:    build and run a holy network
// site:    https://github.com/chuu-p/chryst_tic
// license: MIT License
// version: 0.1
// script:  js

//#region enums
const Button = Object.freeze({
  Up: 0,
  Down: 1,
  Left: 2,
  Right: 3,
  A: 4,
  B: 5,
  X: 6,
  Y: 7,
});

const Color = Object.freeze({
  Black: 0,
  Grey: 1,
  White: 2,
  Brown: 3,
  Orange: 4,
  Pink: 5,
  Flesh: 6,
  Blue: 7,
  Indigo: 8,
  Cyan: 9,
  Olive: 10,
  Green: 11,
  Mist: 12,
  Yellow: 13,
  Magenta: 14,
  Transparent: 15,
});

const Duration = Object.freeze({
  Second: 60,
  Minute: 60 * 60,
  Hour: 60 * 60 * 60,
  Day: 24 * 60 * 60 * 60,
});

const Portrait = Object.freeze({
  Elyvilon: 256 + 0,
  Trog: 256 + 4,
  Tso: 256 + 8,
  Zin: 256 + 12,
  Okawaru: 256 + 64,
  Vehumet: 256 + 68,
});
//#endregion

//#region components
class Position {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class Node {
  /**
   * @param {number} id
   * @param {string} name
   * @param {boolean} enabled
   */
  constructor(id, name, enabled) {
    this.id = id;
    this.name = name;
    this.enabled = enabled;
  }
}
class Transmission {
  /**
   * @param {number} radius
   * @param {string[]} neighbors
   * @param {Connection[]} connections
   */
  constructor(radius, neighbors = [], connections = []) {
    this.radius = radius;
    this.neighbors = neighbors;
    this.connections = connections;
  }
}
class Connection {
  /**
   * @param {string} to_node_name
   * @param {number} from_x
   * @param {number} from_y
   * @param {number} to_x
   * @param {number} to_y
   */
  constructor(to_node_name, from_x, from_y, to_x, to_y) {
    this.to_node_name = to_node_name;
    this.from_x = from_x;
    this.from_y = from_y;
    this.to_x = to_x;
    this.to_y = to_y;
  }
}
class CodeRunner {
  /**
   * @param {string} script
   * @param {number | null} last_execution_time
   * @param {number} execute_every_ticks
   * @param {string[]} messages_in
   * @param {string[]} messages_out
   */
  constructor(
    script,
    last_execution_time,
    execute_every_ticks,
    messages_in,
    messages_out,
  ) {
    this.script = script;
    this.last_execution_time = last_execution_time;
    this.execute_every_ticks = execute_every_ticks;
    this.messages_in = messages_in;
    this.messages_out = messages_out;
  }
}
class Entity {
  /**
   * @param {Position | null} position
   * @param {Node | null} node
   * @param {Transmission | null} transmission
   * @param {CodeRunner | null} code_runner
   */
  constructor(position, node, transmission, code_runner) {
    this.position = position;
    this.node = node;
    this.transmission = transmission;
    this.code_runner = code_runner;
  }
}
//#endregion

//#region render
var dialogue = {
  visible: true,
  name: "Hero",
  line1: "Hello traveler! Welcome to the",
  line2: "network. Press any key to continue...",
  portrait_id: Portrait.Okawaru,
};

function render_dialogue() {
  if (!dialogue.visible) return;

  var box_y = 136 - 40;
  rect(0, box_y, 240, 40, Color.Black);
  rectb(0, box_y, 240, 40, Color.Grey);

  var portrait_x = 240 - 32 - 10;
  var portrait_y = box_y - 32;
  // spr(id x y colorkey=-1 scale=1 flip=0 rotate=0 w=1 h=1)
  spr(
    dialogue.portrait_id,
    portrait_x,
    portrait_y,
    Color.Transparent,
    1,
    0,
    0,
    4,
    4,
  );

  var text_x = 10;
  var text_y = box_y + 8;
  print("Speaker: " + dialogue.line1, text_x, text_y, Color.Grey);
  print(dialogue.line2, text_x, text_y + 10, Color.Grey);
}

function render() {
  var start = time();
  for (let entity of world.entities) {
    /** @type {number} */
    var color = Color.Grey;
    // add 10 ticks of cooldown
    if (!entity.code_runner) continue;
    if (!entity.node) continue;
    if (!entity.position) continue;
    if (!entity.transmission) continue;

    if (
      entity.code_runner.last_execution_time === null ||
      t - entity.code_runner.last_execution_time >=
      entity.code_runner.execute_every_ticks - Duration.Second / 2
    ) {
      color = Color.Yellow;
    }
    pix(entity.position.x, entity.position.y, color); // this can be a filled in circle based on charge and/or max capacity
    circb(
      entity.position.x,
      entity.position.y,
      entity.transmission.radius,
      Color.Grey,
    );
    // name
    print(
      entity.node.name,
      entity.position.x + 12,
      entity.position.y - 12,
      color,
    );
    // x, y, radius
    print(
      "[" +
      entity.position.x +
      " " +
      entity.position.y +
      " r" +
      entity.transmission.radius +
      "]",
      entity.position.x + 12,
      entity.position.y - 4,
      Color.Grey,
    );
    // messages in, out
    print(
      "[" +
      entity.code_runner.messages_in.length +
      " " +
      entity.code_runner.messages_out.length +
      " " +
      "node:1" + // script name and revision
      "]",
      entity.position.x + 12,
      entity.position.y + 4,
      Color.Grey,
    );
    // messages in, out
    print(
      "[" +
      entity.transmission.connections
        .map(
          (/** @type {{ to_node_name: any; }} */ connection) =>
            connection.to_node_name,
        )
        .join(", ") +
      "]",
      entity.position.x + 12,
      entity.position.y + 12,
      Color.Grey,
    );
    for (let connection of entity.transmission.connections) {
      line(
        connection.from_x,
        connection.from_y,
        connection.to_x,
        connection.to_y,
        color,
      );
    }
  }

  render_dialogue();
  var end = time();
  return end - start;
}
//#endregion

//#region engine functions
/**
 * @param {string} node_name
 */
function get_message_count(node_name) {
  let node = world.entities.filter(
    (e) => e.node !== null && e.node.name === node_name,
  )[0];
  if (!node || !node.code_runner) return 0;
  return node.code_runner.messages_in.length;
}
/**
 * @param {string} node_name
 */
function pop_message(node_name) {
  let node = world.entities.filter(
    (e) => e.node !== null && e.node.name === node_name,
  )[0];
  if (!node || !node.code_runner) return null; // TODO: return custom error type when implementing error handling
  return node.code_runner.messages_in.pop();
}
/**
 * @param {string} node_name
 * @param {string} message
 */
function push_message(node_name, message) {
  let node = world.entities.filter(
    (e) => e.node !== null && e.node.name === node_name,
  )[0];
  if (!node || !node.code_runner) return; // TODO: return custom error type when implementing error handling
  node.code_runner.messages_out.push(message);
}
/**
 * @param {string} message
 */
function trace_engine(message) {
  trace("[" + (tstamp() % 10000) + "] " + message);
}
//#endregion

//#region systems
class World {
  constructor() {
    /**
     * @type {Entity[]}
     * @description all entities in the world
     */
    this.entities = [];
    /**
     * @type {string | null}
     * @description name of the selected node
     */
    this.selected_node_name = null;
    /**
     * @type {boolean}
     * @description whether music is playing
     */
    this.music_playing = false;
  }
}
/**
 * @param {Position} a
 * @param {Position} b
 */
function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function check_and_update_neighbors() {
  for (let entity of world.entities) {
    for (let neighbor of world.entities) {
      if (!entity.position || !neighbor.position) continue;
      if (!entity.node || !neighbor.node) continue;
      if (!entity.transmission) continue;
      let neighbor_node_name = neighbor.node.name;

      // guard: skip self
      if (neighbor.node.name === entity.node.name) continue;

      // guard: already connected
      const alreadyConnected = entity.transmission.connections.some(
        (/** @type {{ to_node_name: string; }} */ c) =>
          c.to_node_name === neighbor_node_name,
      );
      if (alreadyConnected) {
        // remove connection if already connected so it gets refreshed
        entity.transmission.connections =
          entity.transmission.connections.filter(
            (/** @type {{ to_node_name: any; }} */ c) =>
              c.to_node_name !== neighbor_node_name,
          );
      }

      const dist = distance(entity.position, neighbor.position);

      // guard: out of range
      if (dist >= entity.transmission.radius) continue;

      // happy path
      entity.transmission.connections.push(
        new Connection(
          neighbor.node.name,
          entity.position.x,
          entity.position.y,
          neighbor.position.x,
          neighbor.position.y,
        ),
      );
    }
  }
}

function code_global_run() {
  for (let entity of world.entities) {
    if (!entity.code_runner) continue;
    if (!entity.node) continue;
    if (
      entity.code_runner.last_execution_time === null ||
      t - entity.code_runner.last_execution_time >=
      entity.code_runner.execute_every_ticks
    ) {
      var func = new Function(
        "trace",
        "getMessageCount",
        "popMessage",
        "pushMessage",
        "nodeName",
        entity.code_runner.script,
      );
      var result = func.call(
        null,
        trace_engine,
        get_message_count,
        pop_message,
        push_message,
        entity.node.name,
      );
      // trace(result);
      entity.code_runner.last_execution_time = t;
    }
  }
}

function handle_input() {
  // move beisfrost x,y with arrow keys
  /** @type {Entity | undefined} */
  let beisfrost = world.entities.find(
    (entity) => entity.node && entity.node.name === "Beisfrost",
  );
  if (!beisfrost || !beisfrost.position) return;

  if (btn(Button.Up)) {
    beisfrost.position.y -= 1;
  }
  if (btn(Button.Down)) {
    beisfrost.position.y += 1;
  }
  if (btn(Button.Left)) {
    beisfrost.position.x -= 1;
  }
  if (btn(Button.Right)) {
    beisfrost.position.x += 1;
  }
}

function systems() {
  var start = time();

  code_global_run();
  handle_input();
  check_and_update_neighbors();

  var end = time();
  return end - start;
}

/**
 * @param {number} num
 */
function round(num) {
  return Math.round(num * 100) / 100;
}
//#endregion

//#region init
var t = 0;
var x = 96;
var y = 24;

var world = new World();
world.entities.push({
  node: new Node(1, "Beisfrost", true),
  position: new Position(120, 60),
  transmission: new Transmission(80, [], []),
  code_runner: new CodeRunner(
    `
    trace("hello from js: " + nodeName);
    `,
    time() + 1,
    Duration.Second * 5,
    [],
    [],
  ),
});
world.entities.push({
  node: new Node(2, "Hagen", true),
  position: new Position(60, 20),
  transmission: new Transmission(80),
  code_runner: new CodeRunner(
    `
    trace("hello from js: " + nodeName);
    `,
    null,
    Duration.Second * 5,
    [],
    [],
  ),
});
//#endregion

const drk = [0, 0, 1, 2, 3, 6, 7, 15, 0, 8, 9, 10, 13, 14, 15, 0];

const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const rnd_choice = (a = 0, b = 1) => (Math.random() > 0.5 ? a : b);
/**
 * @type {{ t: string; x: any; y: any; d: number; c: number; ftl: number; s: number; }[]}
 */
let particles = [];

function water() {
  const h = 68;
  const tt = time() / 400;

  for (let x = 0; x <= 239; x++) {
    for (let y = h; y <= 135; y++) {
      const ox = x + 2 * Math.sin(tt + y);
      const oy = h - (y - h) - 1;

      const oc = pix(ox, oy);
      pix(x, y, drk[oc]);
    }
  }
}

// --- PARTICLES ---

/**
 * @param {number} x
 * @param {number} y
 */
function part(x, y) {
  particles.push({
    t: "rain",
    x,
    y,
    d: Math.PI / 2 + rnd(0, Math.PI / 8),
    c: rnd_choice(Color.White, Color.Magenta),
    ftl: 80 + rnd(0, 90),
    s: rnd(0) / 4,
  });
}

/**
 * @param {any} x
 * @param {any} y
 */
function part2(x, y) {
  particles.push({
    t: "drop",
    x,
    y,
    d: Math.PI / 2 + rnd(0, Math.PI / 8),
    c: Color.Green,
    ftl: 30,
    s: rnd() / 8,
  });
}

function drawParticles() {
  /**
   * @type {number[]}
   */
  const toDelete = [];

  particles.forEach((p, i) => {
    if (p.t === "rain") {
      const l = p.s * 2;

      line(
        p.x,
        p.y,
        p.x - Math.cos(p.d) * l,
        p.y - Math.sin(p.d) * l,
        p.c,
      );

      p.x += Math.cos(p.d) * p.s;
      p.y += Math.sin(p.d) * p.s;
    } else {
      /** @type {number} */
      let c = Color.White;
      if (p.ftl < 10) c = Color.Cyan;
      if (p.ftl < 5) c = Color.Blue;

      ellib(p.x, p.y, 8 - p.ftl / 5, 4 - p.ftl / 10, c);
    }

    if (p.t === "rain") {
      if (p.y >= p.ftl) {
        toDelete.push(i);
        part2(p.x, p.y);
      }
    } else {
      p.ftl -= 1;
      if (p.ftl <= 0) {
        toDelete.push(i);
      }
    }
  });

  // delete backwards
  for (let i = toDelete.length - 1; i >= 0; i--) {
    particles.splice(toDelete[i], 1);
  }
}

//#region main
function TIC() {
  cls(0);
  map();

  water();

  // spawn rain — rate: 0.5 particles/frame (1/4 of original 2/frame)
  if (t % 2 === 0) {
    const x = rnd(-20, 260);
    const y = -5;
    part(x, y);
  }

  drawParticles();

  if (t % 120 < 60) {
    print(`press start`, 96, 60, Color.Grey);
  }

  t++;

  if (!world.music_playing) {
    music(0, 0, 0, true);
    world.music_playing = true;
  }
}
//#region main
// function TIC() {
//   cls(0);
//   map();
//   water();
//   if (t % 120 < 60) {
//     print(`press start`, 96, 60, Color.Grey);
//   }
//   // var duration_render = render();
//   //var duration_systems = systems();
//   t++;
//
//   if (!world.music_playing) {
//     music(0, 0, 0, true);
//     world.music_playing = true;
//   }
//
//   /* print(
//     `ms/f ${round(duration_systems + duration_render)}`,
//     180,
//     0,
//     Color.Grey,
//   );
//   print(`render ${round(duration_render)}`, 180, 8, Color.Grey);
//   print(`system ${round(duration_systems)}`, 180, 16, Color.Grey); */
// }
//#endregion

// <TILES>
// 001:000000dd00000dd00000dd00000dd00000dd00000dd00000dd000000d0000000
// 002:ddddddddddddddd0dddddd00ddddd000dddd0000ddd00000dd000000d0000000
// 003:20000000d2000000dd200000ddd20000dddd2000ddddd200dddddd20ddddddd2
// 004:dddddddd0ddddddd00dddddd000ddddd0000dddd00000ddd000000dd0000000d
// 005:000000020000002d000002dd00002ddd0002dddd002ddddd02dddddd2ddddddd
// 006:000020000002dd00002dddd002dddddd00ddddd0000ddd000000d00000000000
// 007:0000d000000d000000dd00000d0d0000d000d000d0d00d000dd00d000000d000
// 008:20000000d20000000d20000000d20000000d000000d000000d000000d0000000
// 009:0000d0000000d0000000d0000000d0000000d0000000d0000000d0000000d000
// 010:222222220ddddddd00dddddd000ddddd0000dddd00000ddd000000dd0000000d
// 011:0000000022000000dd200000ddd000000dd0000000d00000000d000d0000dddd
// 012:0000d0000000d0000000d0000000d00000dddd000000d00000dddd000000d000
// 013:000ddd0000d000d00d0000d0d000d0d00002ddd00000dd000000000000000000
// 014:0000000d000000dd0000dd000000000000000000000000000000000000000000
// 015:0000000000000000000d2d0000d0dd0000d0000000d00000000d00000000dddd
// 016:0000000022222200222002202220022022222220222222002220000022200000
// 017:0000000022222200222002202220022022222220222002002220022022200220
// 018:0000000022222220222000002220000022222000222000002220000022222220
// 019:0000000002222200222000202222000002222200000222202000222002222200
// 020:0000000022222220002220000022200000222000002220000022200000222000
// 021:0000000002222200222002202220022022222220222002202220022022200220
// 023:000000000000000000000000dddddddd00000000000000000000000000000000
// 024:0000ddd0000dd22d000ddd2d000ddddd000ddddd000ddddd0000ddd000000000
// 025:0000000011111111121212112222222212121211111111110000000000000000
// 026:00000000d0000000ddddd00022222dd0ddddd000d00000000000000000000000
// 027:00000000dddddddddddddddd22222222dddddddddddddddd0000000000000000
// 028:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
// 029:0000000000000000000000000000000000000000002000000000000000000000
// 030:0000000000000000000000000000900000000000000000000000000000000000
// 031:0009000000090000007270000922290000727000000900000009000000000000
// 043:00000000ddddddd0ddddddd022222220ddddddd0ddddddd00000000000000000
// 044:000000000ddddddd0ddddddd022222220ddddddd0ddddddd0000000000000000
// 128:0000000002222200222002202220022022222220222002202220022022200220
// </TILES>

// <SPRITES>
// 000:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 001:fffffffffffffffffffffffffffffff0ffffff01fffff022fffff023ffff0256
// 002:ffffffffffffffffffffffff00ffffff110fffff1110ffff0110ffff53110fff
// 003:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 004:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 005:fffffffffffffffffffffffffffffffffffffffffffffff0ffffff0afffff0ca
// 006:ffffffffffffffffffffffffffffffffffffffff00ffffffaa0fffff7700ffff
// 007:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 008:ffffffffffffffffffffffffffffff0ffffff040ffff0300fff05643ffff0000
// 009:fffffffffffffffffff0ffffff030fffff0640ff0f035000300640110f035c0c
// 010:fffffffffffffffffff0f0ffff06040fff05630f0f06340fc005630fcc0630ff
// 011:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 012:ffffffffffffffffffffffffffffffffffffffffffffff00fffff030fffff033
// 013:ffffffffffffffffffffffffffffff000ffff05630fff06530ff01650fff0245
// 014:ffffffffffffffffffffffff0fffffff50ffffff5100ffff411c0fff44c50fff
// 015:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 016:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 017:ffff0205ffff0256ffff0243ffff0135ffff0113ffff0112fff013a1fff025aa
// 018:00110fff54210fff54210fff4311a0ff022110ff2111a0ff1aa3a10faca5a210
// 019:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 020:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00
// 021:ffff0c70fff0070eff0aa70afff07a7affff0007fffff0aaffff0a7700ff0ca7
// 022:0070ffffaa70ffffa700ffff7700ffff0000ffffaa7000ff00aaa00f00ca0ae0
// 023:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 024:ffff0300fff03643ffff0400fffff030fffff0c0fffff010fffff0c0ffff0430
// 025:0f06400030f002020fff0202ffff0101fffff0ccffff0466fff03a1a0ff03212
// 026:0a4540ff2c000fff1c0fffff1a0fffffa00fffff43300fff1a3a10ff1100120f
// 027:fffffffffffffffffffffffffffffffffffffffffffffffffffffffff00fffff
// 028:fffff033ffffff03ffffff00fffff030ffff0303ffff0333ffff0330ffff0330
// 029:0fff023630ff026630ff015530ff011500ff011200ff01c20fff01a2ffff01a2
// 030:33610fff655110ff655110ff55111c0f11c11c0f2ca11c0f2ca1ca0f2a1cc1c0
// 031:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 032:ffffffffffffffffffffffffff000000ff055665fff00454fffff000fffff053
// 033:fff02a4afff021a5fff02c1a00021a1450021a1502211a143721ca1c0021c711
// 034:cc4a112045a112214aa1c12154a1c12263c1a01234c1a012aa11a001111ca001
// 035:ffffffff0fffffff0fffffff0fffffff10ffffff10ffffff210fffff210fffff
// 036:fffff066fffff06affff0244fff01c43ff0eeeccff0000eef0243300f0244301
// 037:55000370aa3353704aaaa52033777aa2c0000077e0100a00a0eeec3ea0000eee
// 038:a01c03e0a01c0e0aa0ca7a0ae0aa70aa2a7000aa0aaa00a1ecaa7000ecaa700a
// 039:ffffffff0fffffff0fffffff00ffffff000fffff0a0fffff0a0fffffa0ffffff
// 040:fffff0c0fffff010fffff010fffff0c0ffff0543ffff0300ffff02a1ffff02a1
// 041:ff014121ff023212ff014121f01231110021a2120a4aa121a1a30212a1a00121
// 042:2055010f10515000206125541051222110622252205512521061515120524554
// 043:0440ffff4140ffff2130ffff2c40ffff1c40ffff1440ffff4c30ffff4c40ffff
// 044:ffff0330ffff0030fffff030fffff030fffff030fffff000fffff066fffff066
// 045:fff0ccc2fff01ac10ff01a1c0f0aaa110006aac10dd6aacc633550c15335001c
// 046:1a1c11c01acca11c111cac1cc1ccaa1a11cca0a611cca0a61ccaa0031ccaa003
// 047:ffffffff0fffffff0fffffff0fffffff50ffffff50ffffff3d0fffff3d0fffff
// 048:fffff033ffffff0affffff0affffff0affffff01ffffff01fffffff0ffffffff
// 049:0021c7c1071cc7cc071a043507c00c5a77c001a671c0011c1c07011400770126
// 050:11cca00711aaa05334343035a6aaa0304acca0c05a11a010a511c010a421c0c0
// 051:11c0ffff71c0ffff0710ffff07c0ffff07c0ffff710fffff7c0fffff7c0fffff
// 052:02aa430a05aaa43005caaaa0f03ccaaaff035ccafff0066cfffff006fffffff0
// 053:a000a0000f0007070f00710100007171a00071c7cc1107c161000a7a00000a7a
// 054:eeee00000000eee0c0ca0001c71ca0aa0a1aa000aca700000a7aa0000a0ae000
// 055:00ffffffa0ffffffae000fffa0eee00f00000ee0000ff00f000fffff000fffff
// 056:ffff011afffff0c0fffff010ffff0400ffff0633fffff050ffffff0fffffffff
// 057:000201aaf0510366f041031100420422004013220420a522042013220420a522
// 058:106214543052214cc062224c10512251205152512051255420512c5c2051224c
// 059:c140ffff1130ffff2140ffff2140ffff4c40ffffc140ffff1140ffff2130ffff
// 060:fffff056ffffff00ffffff03fffff003fffff030fffff030fffff030fffff030
// 061:300000c10f0300330f0300a30f03001a0f030a1af03e0a1cf03e0c2cf030012c
// 062:1ccaa00633333036a33aa06633c1a06533c1a0003c31c00e3c31c0003cc21000
// 063:50ffffff50ffffff50ffffff50ffffff030fffffe30fffffe30fffffe30fffff
// 064:fffffff0ffffff02fffff022fffff022fffff022fffff022fffff022fffff022
// 065:ffff0fff0ff050ff10040fff10050fff10040ff01005400110f0357c10ff050a
// 066:ffff0ffffff050ffffff040fffff050f00ff040fc700450faa7530ff00a50fff
// 067:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 068:fffffffffffffffffffffffffffff000ffff0191fff09291fff01211fff09119
// 069:ffffffffffffffffffffffffffffffff0fff0f0f10f0202090ff082990ff0192
// 070:ffffffffffffffffffffffffffffffffff0fffff0020ffff820fffff180fffff
// 071:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 072:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 073:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 074:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 075:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 076:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 077:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 078:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 079:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 080:fffff022fffff022fffff022fffff022fffff012fffff012fffff012fffff012
// 081:10fff09010fff01010ff00c71000a00a10a0100010011a0c10caa7a7100700c0
// 082:0900ffff1170ffffca70f0ffa7000a0f00000100ca7ac1a107a7caa70caa7700
// 083:ffffffffffffffffffffffff0fffffffa0ffffff0fffffffa0ffffff0fffffff
// 084:ffff0191ffff0919fffff090fffff090fffff090fffff090fffff010fffff010
// 085:0fff07270fff0921ffff0991ffff0719000000999291807007281078f0007781
// 086:790fffff990fffff990fffff970fffff70000000708928817082811787777000
// 087:ffffffffffffffffffffffffffffffff0fffffff90ffffff0fffffffffffffff
// 088:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 089:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 090:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 091:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 092:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 093:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 094:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 095:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 096:fffff012fffff012fffff012fffff091ffff0566ffff0544fffff01afffff01c
// 097:10f00a2710f01a1c10f017c09001a70c5400a021430a0020c7aa000ca0a70010
// 098:a217a100a1aaa1a77cca71a7a70007caa21a001a72aa707aa770000071aa000a
// 099:ffffffff0fffffff0fffffff0fffffff70ffffff7a0fffff0110ffffa00fffff
// 100:fffff010fffff010fffff010fffff090fffff090fffff090ffff02ccffff02ca
// 101:ff000028ff077797ff087189f0880271f0970827089701720987088109700788
// 102:1000070f97700880818079907287798017770898721708987770009987700089
// 103:ffffffffffffffffffffffffffffffff0fffffff0fffffff0fffffff0fffffff
// 104:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 105:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 106:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 107:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 108:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 109:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 110:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 111:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 112:fffff0aaffffff00ffffff0effffff00fffff056ffffff04fffffff0ffffffff
// 113:700000000f0000e50f00aa000f00acaa4000000000a0aca0f0a000a0f0aa0000
// 114:0770000a40ee007100aa001c00caa0ca70000a0070caaa0a00ca000700000077
// 115:00ffffffc0ffffffa0ffffff70ffffff0a0fffff7a0fffff7a0fffffaa0fffff
// 116:ffff0caafffff090fffff090fffff090fffff097fffff098fffff017fffff010
// 117:0970077709700181097009717970079798707799870078117080781209707812
// 118:7700008818180a2c978702cc78770caa99770800198708001187070021870707
// 119:80ffffff80ffffff080fffff090fffff890fffff970fffff90ffffff90ffffff
// 120:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 121:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 122:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 123:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 124:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 125:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 126:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 127:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 128:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 129:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 130:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 131:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 132:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 133:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 134:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 135:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 136:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 137:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 138:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 139:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 140:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 141:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 142:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 143:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 144:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 145:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 146:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 147:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 148:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 149:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 150:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 151:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 152:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 153:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 154:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 155:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 156:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 157:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 158:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 159:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 160:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 161:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 162:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 163:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 164:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 165:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 166:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 167:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 168:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 169:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 170:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 171:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 172:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 173:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 174:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 175:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 176:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 177:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 178:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 179:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 180:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 181:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 182:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 183:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 184:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 185:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 186:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 187:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 188:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 189:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 190:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 191:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 192:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 193:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 194:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 195:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 196:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 197:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 198:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 199:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 200:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 201:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 202:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 203:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 204:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 205:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 206:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 207:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 208:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 209:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 210:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 211:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 212:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 213:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 214:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 215:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 216:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 217:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 218:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 219:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 220:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 221:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 222:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 223:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 224:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 225:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 226:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 227:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 228:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 229:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 230:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 231:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 232:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 233:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 234:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 235:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 236:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 237:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 238:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 239:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 240:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 241:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 242:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 243:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 244:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 245:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 246:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 247:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 248:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 249:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 250:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 251:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 252:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 253:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 254:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 255:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// </SPRITES>

// <MAP>
// 000:00e10000d1009000d1e1f100d100d100e1d100f100d10000d1f10060f1e1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 001:d10000f150204030e1d1e1d100f100e1d100e100d100f10010c1103060d1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 002:e1d1e15020f1904000500050f05050b0506050f050a0305000c1c0c1e100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 003:0000502000d15000e0c1e0c1e0c100f1c160c1e040300020f1c1902000d1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 004:71717171819160b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b2c1c2b1a1f1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 005:d100403070e140d100c100c100c100e10040c1e100403000e1c190f1e100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 006:d1e1604030d19050b02000200020d0d1f05020e1403020d000c190e1e100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 007:00f1d160403050200000e100f100d1d1e100d1000000d100d12000d10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 008:e100e100d1d19000d1f1000000e100d100d1e1f100d1e10000d1e100f100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 009:00e100d100d19000000000e1000000e1000000d1000000e10000d1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 010:00e1000000009000e100000000e100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </MAP>

// <WAVES>
// 000:b888876559332223468acc4dddcba855
// 001:1235679abcdeffffffffedcba8653210
// 002:0123456789abcdef0123456789abcdef
// 004:edcaa9876543211100000123355689cf
// 005:2456789abccefffffffffeeddb986201
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000204000000000
// 001:0000000000000000000000001000100020002000200030003000400040005000500060007000700090009000a000b000b000c000d000d000e000f00014b000000000
// 002:020002000200020002000200020002000200020002000200020002000200020002000200020002000200020002000200020002000200020002000200209000000000
// 003:f400d400a400740064003400040004000400140004003400340034001400040014002400340034004400440054005400540044004400340024000400359000ff0000
// 004:e307e307e307e307e307e305e304e303e303e302e302e301e301e300e300e300e30fe30fe30fe31ee31ee32de33de34de34ce33ce33be329e308e30834b00000ffff
// 008:0000200060007000800090009000a000b000b000c000c000d000d000d000e000e000e000e000e000e000e000e000e000e000e000e000e000e000e000375000000000
// 009:010001000100010001000100010001000100010001000100010001000100010001000100010001000100010001000100010001000100010001000100442000000000
// 016:030053008300d300e300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300400000000000
// </SFX>

// <PATTERNS>
// 000:677136000000000000000000000000000000d00036000000088010d00036000000000000000000000000000000d000360aa030f00036400038000000000000000000000000000000600038000000000000f00036000000b00036000030000000088010d00036000000000000688036000000000000000000000000000000d00036000000088010d00036000000000000000000000000000000d00036daa036f00036400038000000000000000000000000000000600038000000000000f00036
// 001:f77136000000000000000000b00036000000d00036000000400038600038000000600038000000000000000000000000000000000000000030000000000000000040400038000000d00036000000000000000000000000900036000030b00036000000800036000000000000400036000000000000600036000000000000000030000000000000400036000000000000600036000000000000000000000000000000400036000000000000600036000000000000000000000000000000000000
// 002:477138000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 003:488116000000000000000000000000000000000000000000e881140000000000000000000000000000000000000000007aa116000000000000000000999116000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 004:499114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000988112000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f99112000000100000000000599116000000000000000000000000000000000000000000000000000000000000f88118877118000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 005:000000000000b88114000000f99114000000100000000000888116000000000000000000688116000000000000000000f88114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f991140000000000000000008991160000000000000000000000000000000000000000000000000000000000000000004aa114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 006:000000000000000000000000000000000000a77116000000100000000000000000000000000000000000000000000000000000000000488114000000688114000000d99114000000b99114000000000000000000988114000000000000000000b99114000000100000000000599114000000000000000000000000000000000000000000000000000000000000000000100000000000b88114000000f99114000000100000000000888116000000000000000000688116000000000000000000
// 007:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000699116000000000000000000d99114000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000a77116000000100000000000000000000000000000000000000000000000
// 008:8991160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008771180000000000000000000000000000000000000000008bb118000000000000000000699116000000000000000000f88116000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b99114000000100000000000d99114000000000000000000000000000000000000000000000000000000000000f88118
// 009:f77114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000499114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000988112000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000699118000000100000000000599118000000000000000000000000000000000000000000000000000000000000000000
// 010:400003000000000000400009000000000000400009000000000000400003000000000000400009000000000000400009000000000000400003000000000000400009000000000000400009000000000000400003000000000000400009000000000000400009000000000000400003000000000000400009000000000000400009000000000000400003000000000000400009000000000000400009000000000000400003000000000000400009000000000000400009000000000000400003
// 011:666146000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 012:8771180000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008991160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008881180000000000000000000000000000000000000000008aa118000000000000000000688116000000000000000000f88116000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 013:499114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f771140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004aa114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000988112000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 014:000000000000b88114000000f9911400000010000000000088811600000000000000000068811600000000000000000010000000000000000000000000000000000000000000000068811a000000000000000000000000000000000000000000100000000000b88114000000f991140000001000000000008aa116000000000000000000688118000000000000000000100000000000477114000000688114000000daa114000000b88114000000000000000000988114000000000000000000
// 015:000000000000000000000000000000000000a88116000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f88118100000000000000000000000000000000000a77116000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 016:b99114000000100000000000d99114000000000000000000000000000000000000000000000000000000000000e881169bb118000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000677118000000000000000000000000000000000000000000999118000000000000000000000000000000000000000000877118000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 017:f99116000000100000000000899114000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d77118000000000000000000000000000000000000000000100000000000000000000000000000000000000000f88118100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 018:6991180000001000000000005881180000000000000000000000000000000000000000000000000000000000000000006aa11400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000049911a000000000000000000000000000000000000000000699114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 019:699114000000100000000000888118000000000000000000000000000000000000000000000000000000000000000000100000000000d881140000008aa116000000e88114000000999116000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000d771140000008aa116000000f88114000000caa116000000000000000000000000000000000000000000
// 020:033110066600000000000010000010000000000090000000000010900098000000000010d00098000000000000600098000000000000000070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 021:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000099911a69911400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000049911c000000000000000000000000000000000000000000699114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 022:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d771140000008aa116000000e881140000009aa116000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000d771140000008aa116000000f88114000000caa116000000000000000000000000000000000000000000
// 023:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d7711a000000000000000000000000000000000000000000100000000000000000000000000000000000000000f8811a100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 024:f881180000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008991160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008881180000000000000000000000000000000000000000008aa118000000000000000000688116000000000000000000f77116000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 025:499114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f881140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004aa114000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000999112000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 026:000000000000b77114000000f8811400000010000000000088811600000000000000000068811600000000000000000010000000000000000000000000000000000000000000000068811a000000000000000000000000000000000000000000100000000000b88114000000f991140000001000000000008aa116000000000000000000688118000000000000000000100000000000477114000000699114000000d99114000000b88114000000000000000000988114000000000000000000
// 027:000000000000000000000000000000000000a77116000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f99118100000000000000000000000000000000000a88116000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 028:b88116000000100000000000d99116000000000000000000000000000000000000000000000000000000000000000000966116000000100000000000b77116000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 029:688118000000100000000000d88114000000000000000000000000000000000000000000000000000000000000000000977114000000100000000000977114000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 030:699114000000100000000000899118000000000000000000000000000000000000000000000000000000000000000000466118000000100000000000677118000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 031:b99114000000100000000000888114000000000000000000000000000000000000000000000000000000000000000000c77112000000100000000000e77112000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 059:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </PATTERNS>

// <TRACKS>
// 000:100003245003300003000000000000000000000000000000000000000000000000000000000000000000000000000000290000
// </TRACKS>

// <PALETTE>
// 000:000000bababafefefe894523cd6754ef9889febaab01326723768923abba4576452398459cba8cfecd0173003100ff00
// </PALETTE>

