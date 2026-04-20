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
  White: 1,
  Accent: 2,
  Orange: 3,
  Green: 4,
  Grey: 5,
});

const Duration = Object.freeze({
  Second: 60,
  Minute: 60 * 60,
  Hour: 60 * 60 * 60,
  Day: 24 * 60 * 60 * 60,
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
function render() {
  var start = time();
  for (let entity of world.entities) {
    var color = Color.Grey;
    // add 10 ticks of cooldown
    if (
      entity.code_runner.last_execution_time === null ||
      t - entity.code_runner.last_execution_time >=
      entity.code_runner.execute_every_ticks - (Duration.Second / 2)
    ) {
      color = Color.Green;
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
      entity.transmission.connections.map((connection) => connection.to_node_name).join(", ") +
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
  var end = time();
  return end - start;
}
//#endregion

//#region systems
class World {
  constructor() {
    this.entities = [];
    this.selected_node_name = null;
  }
}


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
    Color.White,
  );
  print(`render ${round(duration_render)}`, 180, 8, Color.White);
  print(`system ${round(duration_systems)}`, 180, 16, Color.White);
}
//#endregion

// <TILES>
// 000:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 001:fffffffffffffffffffffffffffffff0ffffff08fffff011fffff01affff01b8
// 002:ffffffffffffffffffffffff00ffffff880fffff8880ffff5880ffffba880fff
// 003:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 004:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 005:fffffffffffffffffffffffffffffffffffffffffffffff0ffffff09fffff095
// 006:ffffffffffffffffffffffffffffffffffffffff00ffffffaa0fffff5550ffff
// 007:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 008:ffffffffffffffffffffffffffffff0ffffff0b0ffff0a55fff0b8baffff0555
// 009:fffffffffffffffffff0ffffff0a0fffff08b0ff0f0ab000a008b0880f0ab909
// 010:fffffffffffffffffff0f0ffff080b0fff0b8a0f0f08ab0f900b8a0f9908a0ff
// 011:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 012:ffffffffffffffffffffffffffffffffffffffffffffff00fffff030fffff035
// 013:ffffffffffffffffffffffffffffff000ffff0b850fff08b50ff088b0fff014b
// 014:ffffffffffffffffffffffff0fffffffb0ffffffb800ffff48890fff449b0fff
// 015:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 016:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 017:ffff015bffff01b8ffff014affff08abffff088affff0881fff08aa8fff01b9a
// 018:55880fffb4180fffb4180fff4a8890ff511880ff1888a0ff8aaaa80fa99b9180
// 019:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 020:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00
// 021:ffff0950fff00503ff099509fff05a55ffff0005fffff0a9ffff095500ff0995
// 022:0050ffff9a50ffff5550ffff5550ffff5500ffff9a5500ff5599950f00995930
// 023:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 024:ffff0a55fff0a8baffff0b55fffff0a0fffff090fffff080fffff090ffff0ba5
// 025:0f08b000a0f001010fff0101ffff0808fffff099ffff0b88fff0a9890ff0a181
// 026:09bbb0ff19000fff890fffff890fffff900fffffbaa00fff89a980ff8800810f
// 027:fffffffffffffffffffffffffffffffffffffffffffffffffffffffff00fffff
// 028:fffff035ffffff03ffffff05fffff055ffff0555ffff0355ffff0355ffff0330
// 029:0fff01a830ff01b850ff08bb50ff088b50ff088150ff08910fff0891ffff0891
// 030:aab80fffbbb880ffbbb880ffbb88890f8898890f1998890f1998950f19899890
// 031:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 032:ffffffffffffffffffffffffff000000ff0bb88bfff00bbbfffff055fffff0ba
// 033:fff01949fff0189bfff019890001898bb001898b51188a8ba5189a8955189588
// 034:994988104ba88118ba989818bb9898118a989081a49890819988a0088889a008
// 035:ffffffff0fffffff0fffffff0fffffff80ffffff80ffffff180fffff180fffff
// 036:fffff088fffff08affff08bbfff089baff033399ff055535f08baa55f08bba58
// 037:bb000355aa33b355baaaab15aa555aa1955555555085595595333933a0000333
// 038:908953309089035a95995a5a359955991a55509a599a50a8599a5055599a5009
// 039:ffffffff0fffffff0fffffff50ffffff550fffff5a0fffff590fffff90ffffff
// 040:fffff090fffff080fffff080fffff090ffff0bbaffff0a55ffff0198ffff0198
// 041:ff08b818ff01a181ff08b818f081a8880018a1810949a818a89a0181a8900818
// 042:10bb080f80b8b00010888bbb80b88188808811b810bb81b88088b8b810b8bbbb
// 043:0bb0ffffb840ffff88a0ffff8940ffff89b0ffff84b0ffff49a0ffff4940ffff
// 044:ffff0530ffff0530fffff055fffff055fffff055fffff055fffff08bfffff08b
// 045:fff09991fff089980ff08a890f0a9a8800089a98022baa99b33bb098b55b0089
// 046:89898890899998898889a9899899a9898899a09b8899a0a88999a0058999a005
// 047:ffffffff0fffffff0fffffff0fffffffb0ffffffb0ffffff320fffff320fffff
// 048:fffff0aaffffff0affffff0affffff0affffff08ffffff08fffffff0ffffffff
// 049:5518959855899599558a0bab559009ba559008a8589008898905088b00550818
// 050:8899a005889aa0baababa0aba8aaa0a5ba99a095ba889085ab889085ab189095
// 051:8890ffff5890ffff5580ffff5590ffff5590ffff580fffff590fffff590fffff
// 052:08aaba5a0baaaba50b9aaaa5f0399aaaff03b99afff00889fffff008fffffff0
// 053:a000a0000f0055550f00585850005858a55058959988059888000a5a00000a5a
// 054:3333500500003335959a00089589a09a5a8aa000a9a550000a5aa0000a5a3000
// 055:50ffffff90ffffffa3000fffa033300f00000330000ff00f000fffff000fffff
// 056:ffff0889fffff090fffff080ffff0b55ffff08aafffff0b0ffffff0fffffffff
// 057:00080899f0b80a88f0b80a8800b80b1100b08a110b80ab110b808a110b10ab11
// 058:80888bb4a0b81849908811b980b881b880b8b1b880b88bb480b819b910b81849
// 059:9840ffff88a0ffff8840ffff88b0ffff4940ffff98b0ffff8840ffff88a0ffff
// 060:fffff0bbffffff05ffffff05fffff055fffff035fffff030fffff030fffff030
// 061:a00050980f0550350f0550a30f05508a0f050989f0550989f0550989f0550889
// 062:899aa00b535350a8a53aa08b5398a0bb35989000593890553958905559988055
// 063:b0ffffffb0ffffffb0ffffffb0ffffff050fffff550fffff550fffff550fffff
// 064:fffffff0ffffff06fffff061fffff061fffff061fffff061fffff061fffff061
// 065:ffff0fff0ff0b0ff60040fff600b0fff60040ff0600b400860f0ab5960ff0b5a
// 066:ffff0ffffff0b0ffffff040fffff0b0f00ff040f95004b0faa5ba0ff559b0fff
// 067:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 068:fffffffffffffffffffffffffffff000ffff0696fff09166fff06166fff09666
// 069:ffffffffffffffffffffffffffffffff0fff0f0f60f0606090ff0a6990ff0696
// 070:ffffffffffffffffffffffffffffffffff0fffff0060ffffa60fffff6a0fffff
// 071:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 072:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 073:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 074:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 075:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 076:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 077:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 078:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 079:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 080:fffff061fffff061fffff061fffff061fffff061fffff061fffff061fffff061
// 081:60fff06060fff08060ff00956000900a6090800560088a59609aa5a560050595
// 082:0650ffff8850ffff9a50f0ffa500090f500008009a5a98a855a59aa559aa5500
// 083:ffffffffffffffffffffffff0fffffff90ffffff0fffffffa0ffffff0fffffff
// 084:ffff0666ffff0969fffff0a0fffff0a0fffff090fffff090fffff060fffff060
// 085:0fff05150fff0966ffff0996ffff0569000000999696a050056a605af00055a6
// 086:590fffff990fffff990fffff950fffff5000000050a96aa650a6a665a5555000
// 087:ffffffffffffffffffffffffffffffff0fffffff90ffffff0fffffffffffffff
// 088:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 089:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 090:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 091:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 092:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 093:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 094:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 095:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 096:fffff061fffff061fffff061fffff098ffff0b88ffff0b44fffff08afffff089
// 097:60f05a8560f08a8960f085959008a559b405a0884a0a0085959a0059a5a50085
// 098:a885a850a8aaa8a5599a58a5a550059aa88a508a58aa505aa555000058aa505a
// 099:ffffffff0fffffff0fffffff0fffffff50ffffff5a0fffff5880ffffa00fffff
// 100:fffff060fffff060fffff060fffff090fffff090fffff0a0ffff0199ffff019a
// 101:ff00001aff055595ff0a56a9f0aa0156f0950a150a95065609a50aa6095005aa
// 102:6000050f95500aa0a6a0599056a559a065550a9a56650a9a55500099a55000a9
// 103:ffffffffffffffffffffffffffffffff0fffffff0fffffff0fffffff0fffffff
// 104:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 105:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 106:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 107:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 108:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 109:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 110:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 111:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 112:fffff0aaffffff00ffffff05ffffff00fffff0b8ffffff0bfffffff0ffffffff
// 113:500000500f00005b0f0055500f0059aab0000005005059a0f05000a5f0550500
// 114:0555000ab055005800555089009aa59a55500500509aa505009a000500505055
// 115:50ffffff90ffffffa0ffffff50ffffff050fffff550fffff550fffff550fffff
// 116:ffff09aafffff0a0fffff090fffff090fffff095fffff09afffff065fffff060
// 117:09500555095006a609500956595005959a505599a5005a6650a05a610a505a61
// 118:550000aa6a6a0a1995a501995a5509aa99550a0069a50a0066a5050066a50505
// 119:a0ffffffa0ffffff0a0fffff090fffffa90fffff950fffff90ffffff90ffffff
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
// 000:000000fffffff7d100e86800c0d725333333abcdefabcdefcbd1be8f938952534ce0a46eabcdefabcdefabcdef00ff00
// </PALETTE>

