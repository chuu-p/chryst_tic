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
  Green: 3,
  Red: 4,
  Grey: 5,
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
  constructor(radius) {
    this.radius = radius;
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

//#region systems
class World {
  constructor() {
    this.entities = [];
  }
}

function render() {
  var start = time();
  for (let entity of world.entities) {
    // add 10 ticks of cooldown
    if (
      entity.code_runner.last_execution_time === null ||
      t - entity.code_runner.last_execution_time >=
        entity.code_runner.execute_every_ticks - 30
    ) {
      circb(
        entity.position.x,
        entity.position.y,
        entity.transmisssion.radius,
        Color.Accent,
      );
      print(
        entity.node.name,
        entity.position.x,
        entity.position.y,
        Color.Accent,
      );
    } else {
      circb(
        entity.position.x,
        entity.position.y,
        entity.transmisssion.radius,
        Color.Grey,
      );
      print(entity.node.name, entity.position.x, entity.position.y, Color.Grey);
    }
  }
  var end = time();
  return end - start;
}

function code_global_run() {
  var start = time();
  for (let entity of world.entities) {
    // if last_execution_time is null then execute
    if (
      entity.code_runner.last_execution_time === null ||
      t - entity.code_runner.last_execution_time >=
        entity.code_runner.execute_every_ticks
    ) {
      var func = new Function(entity.code_runner.script);
      var result = func.call(null, 1, 2, "hello"); //invoke the function using arguments  entity.code_runner.run();
      trace(result);
      entity.code_runner.last_execution_time = t;
    }
  }
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
  transmisssion: new Transmission(10),
  code_runner: new CodeRunner(
    "return JSON.stringify(arguments);",
    time() + 30,
    60 * 5,
    [],
    [],
  ),
});
world.entities.push({
  node: new Node(2, "Hagen", true),
  position: new Position(60, 20),
  transmisssion: new Transmission(10),
  code_runner: new CodeRunner(
    "return `hagen` + JSON.stringify(arguments);",
    null,
    60 * 5,
    [],
    [],
  ),
});
//#endregion

//#region main
function TIC() {
  cls(0);
  var duration_render = render();
  var duration_code_global_run = code_global_run();
  t++;

  print(
    `ms/f ${round(duration_code_global_run + duration_render)}`,
    180,
    0,
    Color.White,
  );
  print(`rndr ${round(duration_render)}`, 180, 8, Color.White);
  print(`code ${round(duration_code_global_run)}`, 180, 16, Color.White);
}
//#endregion

// <TILES>
// 001:eccccccccc888888caaaaaaaca888888cacccccccacc0ccccacc0ccccacc0ccc
// 002:ccccceee8888cceeaaaa0cee888a0ceeccca0ccc0cca0c0c0cca0c0c0cca0c0c
// 003:eccccccccc888888caaaaaaaca888888cacccccccacccccccacc0ccccacc0ccc
// 004:ccccceee8888cceeaaaa0cee888a0ceeccca0cccccca0c0c0cca0c0c0cca0c0c
// 017:cacccccccaaaaaaacaaacaaacaaaaccccaaaaaaac8888888cc000cccecccccec
// 018:ccca00ccaaaa0ccecaaa0ceeaaaa0ceeaaaa0cee8888ccee000cceeecccceeee
// 019:cacccccccaaaaaaacaaacaaacaaaaccccaaaaaaac8888888cc000cccecccccec
// 020:ccca00ccaaaa0ccecaaa0ceeaaaa0ceeaaaa0cee8888ccee000cceeecccceeee
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
// 000:000000fffffff7d100e86800c0d725333333abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef
// </PALETTE>
