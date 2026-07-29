<div align="center">

# SimulationEngine

**A grid-based factory logistics simulation engine built with Vue 3 + Pixi.js**

Entity editing for machines, belts, and pipes with real-time collision detection, port connection, box selection, viewport navigation, and visual interaction.

English | [简体中文](./README.zh-CN.md)

![Vue](https://img.shields.io/badge/Vue_3-4FC08D?logo=vuedotjs&logoColor=white)
![Pixi](https://img.shields.io/badge/Pixi.js_8-E01E5A?logo=pixijs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=black)

</div>

---

# Overview

SimulationEngine is a 2D grid-based simulation engine for factory logistics games. It adopts a **data-driven + layered architecture** where rendering, business logic, and storage are fully decoupled. Entities are configured via external JSON and loaded at startup.

---

# Features

## Machine System

- **Mask matrix** describes machine footprint with arbitrary shapes
- 90° rotation with automatic width/height swap and anchor switching
- Four-direction ports: `bi` (belt input), `bo` (belt output), `pi` (pipe input), `po` (pipe output)
- **Placement workflow**: select type → mask follows mouse with real-time conflict/boundary preview → click to place
- Hover highlight and recipe icon overlay (2-column input/output layout)

## Belt & Pipe System

Both systems share a unified architecture:

- Single-click placement / continuous laying
- **Node placement**: split, merge, cross nodes with configurable direction
- R to rotate node before placement
- Auto L-shaped path connecting machine ports
- Same-cell overwrite with cross-node handling
- BFS connected-component search

## Selection System

- Box select, move, rotate, delete, copy
- Long-press machine to enter move mode with offset preview
- Rotate during move (R key around selection center)
- All operations include real-time collision and boundary detection

## Collision Detection

| Function | Purpose |
|----------|---------|
| `detectOnPlaceMachine` | Machine vs. existing entities (supports rotated mask) |
| `detectOnPlaceBatch` | Belt/pipe batch placement vs. entity/port/node |
| `detectOnPlaceNode` | Single node placement conflict (belt/pipe node overlap) |
| `detectOnPlaceFinalIsPort` | Port type + direction matching |
| `detectOnPlaceFinalIsNode` | Node direction matching |
| `detectOnMoveMask` | Selection move vs. entity overlap |
| `checkMachineBounds` | Scene boundary clamp |

## Viewport

- Drag to pan (auto-disabled during editing)
- Mouse wheel zoom centered on cursor
- Scene boundary clamping

## Indicator System

Preview mask (blue), conflict overlay (red), entity hover highlight, box selection rectangle, move offset preview — all rendered as Pixi Graphics/Container overlays with port arrow sprites.

---

# Architecture

```
Application
│
├── Stores          Pinia state management
├── Storage         Grid spatial mapping & entity lookup
├── Sub             Business logic (Indicator, Machine, Belt, Pipe...)
├── Stage           Pixi rendering layer
├── Container       Pixi Container wrappers (BeltContainer, MachineContainer...)
├── Middleware      Utilities, conflict detection, position conversion
├── Loader          External config & asset loading (JSON, textures)
└── Graphic         Reusable graphic components (indicator, hover, select)
```

Unidirectional dependency: `Stores → Storage → Middleware → Sub → Stage`

---

# Quick Start

```bash
pnpm install
pnpm dev       # development
pnpm build     # production
pnpm preview   # preview build
```

---

# Tech Stack

- **Vue 3** — UI framework
- **Pixi.js 8** — Canvas rendering (Grid-based)
- **Pinia** — State management
- **Vite** — Build tool
