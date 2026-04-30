# Gameplay

## Overview

A `TIC-80 javascript with ECS` game about implementing a holy network.

## Core Loop

The game loop will be:

- Story / exposition / dialog
- Solve a technical problem with code
- Repeat

---


In line routing with one node type
Conditions 
- 5 nodes arranged in a line formation with each node having one or two neighbors 
- the challenge is to write the code so they can message pass Everyone to everyone 
- the solution is to parse the message if it is meant for me but if not then send it to the neighbor it did not come from 
- if sending a message initially, send to all neighbors (one or two)
- (i have to write the acceptance test suite for this)
Acceptance criteria
- [ ] the same piece of code gets deployed to every node in the network



## Universe Basis

Chryst is a priest in a fantasy world, where magic is real.

## Levels

### Level 0 - Tutorial

_(Dan Harmon story circle "you")_
Chryst origin story: how he discovers that he can write prayers as programs and the stuff in the programs actually comes true. Step by step he discovers it, and this will form the tutorial steps.
_Once, men coexisted with each other. They shared peace forged in wisdom, a peace that lasted many generations._

### Level 1 - One Node

**Plot**: See `[[Chapter - Bysfrost]]`
**Gameplay**: Tower defense as programming. The user has to defend a node from monsters.
The code will look like this:

```
if enemy is in detection radius
emit enemy distraction signal (this takes power from capacity)
```

### Level 2 - Two Nodes

A second node is added, and the user now has the ability to send messages and power from one node to another.

- The message system uses a message stack that can be read when the code runs in the specific tick.
- The code system is hard capped by ms per invocation (mana). If an invocation takes more than 16ms, the node will be disabled and has to be re-enabled. (At first manually with a 10s boot wait, later handled by workers).
  Example algorithm:

```
if their_capacity_percentage is higher than my_capacity_percentage then dont send power, else send power.
if monster in radius: deter monster based on distance, if it is closer, then send more power to it.
```

### Level 3 - Multiple Nodes in a Line

The user has to implement routing in a line with message passing.

### Level 4 - Multiple Nodes in a Grid

The user has to implement routing in a grid with message passing based on an algorithm like packet flooding.

## Game Design Systems

The game has three main gameplay systems.

### Dialog System

The game has a plot and characters, and you can talk to them to advance the plot and get exposition.

- The player can choose what to say, and the characters will react accordingly, affecting the plot.
- A **reputation system** exists where each kingdom/faction has a reputation with the player.
- Choosing correct dialogue options increases reputation, while incorrect ones decrease it.
- **Consequences**: High reputation unlocks territories on the map. The player can choose their playstyle based on this—for example, being a pacifist, or a ruthless capitalist who excludes dictator states from the power grid.

### Power System

- Each node generates power each tick based on the node size, and has a base demand.
- Generation is normally higher than demand, creating a surplus.
- Nodes have a capacity to store power, and can spend a little or a lot to deter monsters.
- Nodes can send/receive power to/from other nodes within connection radius.
- In later levels, players can run different functions (like making the node invisible).

### Code Runner System

- The user must solve technical problems with clever software engineering.
- User code runs on each node every tick.
- The user must optimize the schedule to run the fewest ticks possible in order to save power.
- Problems fit together sequentially, building into a cohesive level-based system.

### Worker Management System

**Automated Repairs**:

- If a node is destroyed by monsters or blows up due to the 16ms timeout, workers can repair it.
- Initially done manually by the player, but later automated via code running on a "Worker Central" node.
  Example automation:

```
# Node behavior
if node is damaged:
  send message to worker central

# Worker central behavior
if message in stack:
  send workers to repair it
```
