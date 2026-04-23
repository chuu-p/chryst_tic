# Dynamic Cutscene & Dialogue System for TIC-80

This document outlines a memory-efficient, flexible cutscene system designed for the limitations of TIC-80 (240x136px, indexed palette, limited RAM).

## 1. Core Architecture: "The Sequence Runner"

Instead of hard-coding cutscenes, we use a **Command Pattern**. A cutscene is an array of "instructions" processed by a global `CutsceneManager`.

### Why this approach?
- **Decoupling**: Plot data is separate from rendering logic.
- **Memory**: Commands are just small objects or packed strings.
- **Flexibility**: Easy to add new commands (SFX, camera shakes, etc.) without touching the main game loop.

## 2. Data Structure (The "Script")

A cutscene is defined as an array of objects. This fits naturally into JavaScript.

```javascript
const intro_cutscene = [
  { cmd: "portrait", id: Portrait.Astryd, side: "left" },
  { cmd: "text", name: "Astryd", msg: "You should be grateful..." },
  { cmd: "text", name: "Guy", msg: "We know how this goes." },
  { cmd: "wait", frames: 60 },
  { cmd: "sfx", id: 1 },
  { cmd: "choice", options: [
      { text: "Help her", next: "help_branch" },
      { text: "Stay back", next: "wait_branch" }
  ]}
];
```

## 3. Implementation Details

### State Management
We need a global state object to track the current cutscene, the current index, and the "typewriter" effect state.

```javascript
var cutscene_state = {
  active: false,
  script: [],
  index: 0,
  timer: 0,
  typewriter: 0, // Characters revealed
  choices: null
};
```

### The "Step" Function
In the main `TIC()` loop, if a cutscene is active, we prevent normal player input and process the current command.

```javascript
function update_cutscene() {
  if (!cutscene_state.active) return;
  
  let current = cutscene_state.script[cutscene_state.index];
  
  // Handle "Text" command with typewriter effect
  if (current.cmd === "text") {
    if (cutscene_state.typewriter < current.msg.length) {
      if (t % 2 === 0) cutscene_state.typewriter++; // speed control
    }
    
    if (btnp(Button.A)) { // Advance
      if (cutscene_state.typewriter < current.msg.length) {
        cutscene_state.typewriter = current.msg.length; // Skip typewriter
      } else {
        advance_cutscene();
      }
    }
  }
  // Other commands: wait, sfx,Portrait change...
}
```

## 4. Visual Design & Constraints

### Text Box (240x40px)
- **Position**: Bottom of screen (Y=96).
- **Font**: TIC-80 built-in `print()` is 5x5 + 1px spacing.
- **Characters per line**: ~38 characters.
- **Portraits**: 32x32 sprites (4x4 tiles).

### Optimization for 124x124 limit
The user mentioned a 124x124 limit. In TIC-80, this usually refers to the sprite sheet area used for portraits. 
- We can pack **16 portraits** (32x32 each) in a 128x128 area.
- By using `spr()` with `w=4, h=4`, we draw them efficiently.
- **Dynamic Palettes**: Use `pal()` to swap colors for "negative" or "dream" sequences without duplicating sprites.

## 5. Branching & Persistence

The `choice` command integrates with the `reputation` system mentioned in `README.md`.

```javascript
if (choice_made === "Help her") {
  reputation.maxt += 10;
  // Jump to label or swap script
  cutscene_state.script = branch_help;
  cutscene_state.index = 0;
}
```

## 6. Implementation Workflow
1. **System**: Add `cutscene_state` and `update_cutscene()`.
2. **Render**: Enhance `render_dialogue()` to handle the typewriter effect and choices.
3. **DSL**: Define characters and portraits as constants.
4. **Integration**: Call `start_cutscene(script)` from level initialization or triggers.
