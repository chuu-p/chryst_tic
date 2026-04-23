# AGENTS.md

## Project Overview

This is a TIC-80 (JS) game for building and running a holy network. It consists of network nodes that can communicate with each other within transmission radius.

## Important Commands

```bash
nix develop --command tsc --project jsconfig.json # Check for TypeScript errors
```

## Code Structure

- `chryst.js` - Single-file TIC-80 game (680 lines)
- Entry point: `TIC()` function (line 386)

## Key Conventions

- Uses `#region` comments to organize code (enums, components, render, systems, init, main)
- Constants defined as frozen objects (Button, Color, Duration, Portrait)
- Entity system: Node + Position + Transmission + CodeRunner components
- Runtime: `t` is tick counter, use `time()` for floating-point time
