// title:   chryst
// author:  chuu801@pm.me
// desc:    build and run a holy network
// site:    https://github.com/chuu-p/chryst_tic
// license: MIT License
// version: 0.1
// script:  js

//#region scratchpad
// 000:000000fffffff7d100e86800c0d725333333abcdefabcdefcbd1be8f938952534ce0a46eabcdefabcdefabcdef00ff00
//#endregion

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
  Elyvilon: 0,
  Trog: 4,
  Tso: 8,
  Zin: 12,
  Okawaru: 64,
  Vehumet: 68,
});
//#endregion

//#region components
class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class Node {
  constructor(id, name, enabled) {
    this.id = id;
    this.name = name;
    this.enabled = enabled;
  }
}
class Transmission {
  constructor(radius, neighbors = [], connections = []) {
    this.radius = radius;
    this.neighbors = neighbors;
    this.connections = connections;
  }
}
class Connection {
  constructor(to_node_name, from_x, from_y, to_x, to_y) {
    this.to_node_name = to_node_name;
    this.from_x = from_x;
    this.from_y = from_y;
    this.to_x = to_x;
    this.to_y = to_y;
  }
}
class CodeRunner {
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
//#endregion

//#region render
var dialogue = {
  visible: true,
  name: "Hero",
  line1: "Hello traveler! Welcome to the network.",
  line2: "Press any key to continue...",
  portrait_id: 0,
};

function render_dialogue() {
  if (!dialogue.visible) return;

  var box_y = 136 - 40;
  rect(0, box_y, 240, 40, Color.Black);
  rectb(0, box_y, 240, 40, Color.Pink);

  var portrait_x = 240 - 32 - 10;
  var portrait_y = box_y - 32;
  // spr(id x y colorkey=-1 scale=1 flip=0 rotate=0 w=1 h=1) 
  spr(dialogue.portrait_id, portrait_x, portrait_y, Color.Transparent, 1, 0, 0, 4, 4);

  var text_x = 10;
  var text_y = box_y + 8;
  print("Speaker: " + dialogue.line1, text_x, text_y, Color.Pink);
  print(dialogue.line2, text_x, text_y + 10, Color.Pink);
}

function render() {
  var start = time();
  for (let entity of world.entities) {
    var color = Color.Pink;
    // add 10 ticks of cooldown
    if (
      entity.code_runner.last_execution_time === null ||
      t - entity.code_runner.last_execution_time >=
      entity.code_runner.execute_every_ticks - (Duration.Second / 2)
    ) {
      color = Color.Orange;
    }
    pix(entity.position.x, entity.position.y, color); // this can be a filled in circle based on charge and/or max capacity
    circb(
      entity.position.x,
      entity.position.y,
      entity.transmission.radius,
      Color.Pink,
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
      Color.Pink,
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
      Color.Pink,
    );
    // messages in, out
    print(
      "[" +
      entity.transmission.connections.map((connection) => connection.to_node_name).join(", ") +
      "]",
      entity.position.x + 12,
      entity.position.y + 12,
      Color.Pink,
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
function get_message_count(node_name) {
  return world.entities.filter((e) => e.node.name === node_name).at(0)
    .code_runner.messages_in.length;
}
function pop_message(node_name) {
  return world.entities
    .filter((e) => e.node.name === node_name)
    .at(0)
    .code_runner.messages_in.pop();
}
function push_message(node_name, message) {
  world.entities
    .filter((e) => e.node.name === node_name)
    .at(0)
    .code_runner.messages_out.push(message);
}
function trace_engine(message) {
  trace("[" + (tstamp() % 10000) + "] " + message);
}
//#endregion

//#region systems
class World {
  constructor() {
    this.entities = [];
    this.selected_node_name = null;
  }
}
function distance(a, b) {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function check_and_update_neighbors() {
  for (let entity of world.entities) {
    for (let neighbor of world.entities) {
      // guard: skip self
      if (neighbor.node.name === entity.node.name) continue;

      // guard: already connected
      const alreadyConnected = entity.transmission.connections.some(
        (c) => c.to_node_name === neighbor.node.name,
      );
      if (alreadyConnected) {
        // remove connection if already connected so it gets refreshed
        entity.transmission.connections =
          entity.transmission.connections.filter(
            (c) => c.to_node_name !== neighbor.node.name,
          );
      }

      const dist = distance(entity, neighbor);

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
  let beisfrost = world.entities.find(
    (entity) => entity.node.name === "Beisfrost",
  );
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

//#region main
function TIC() {
  cls(0);
  var duration_render = render();
  var duration_systems = systems();
  t++;

  print(
    `ms/f ${round(duration_systems + duration_render)}`,
    180,
    0,
    Color.Pink,
  );
  print(`render ${round(duration_render)}`, 180, 8, Color.Pink);
  print(`system ${round(duration_systems)}`, 180, 16, Color.Pink);
}
//#endregion

// <TILES>
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
// </TILES>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304000000000
// </SFX>

// <TRACKS>
// 000:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </TRACKS>

// <PALETTE>
// 000:000000bababafefefe894523cd6754ef9889febaab01326723768923abba4576452398459cba8cfecd0173003100ff00
// </PALETTE>

