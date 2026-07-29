<div align="center">

# SimulationEngine

**A grid-based factory logistics simulation engine built with Vue 3 + Pixi.js**

Supports machine, conveyor belt, and pipe entity editing with real-time collision detection, port connection, box selection, viewport navigation, and visual interaction.

English | [简体中文](./README.zh-CN.md)

![Vue](https://img.shields.io/badge/Vue_3-4FC08D?logo=vuedotjs&logoColor=white)
![Pixi](https://img.shields.io/badge/Pixi.js_8-E01E5A?logo=pixijs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=black)

</div>

---

# Overview

SimulationEngine is a 2D grid-based simulation engine for factory logistics games. It adopts a **data-driven + layered architecture** design, with rendering, business logic, and storage fully decoupled.

---

# Features

## Machine System

- Mask matrix describes machine footprint with arbitrary shapes
- 90° rotation with automatic width/height swap and anchor switching
- Belt / Pipe four-direction ports (`bo`/`bi`/`po`/`pi`)
- **Placement workflow**: click machine button → mask follows mouse with real-time conflict/boundary preview → click to confirm placement
- **Placement rotation**: press R during placement to rotate the preview mask
- Hover highlight feedback

## Belt & Pipe System

Both systems share a unified architecture:

- Single-segment (default) placement / continuous laying
- **Node placement**: click-to-place single nodes (split / merge / cross / default) with type selector UI; select belt or pipe type, then node type, then click to confirm
- **Node rotation**: press R during node placement preview to rotate the node direction
- Auto L-shaped path (vertical-first / horizontal-first mode toggle)
- Auto-connect to machine ports
- Same-cell overwrite and cross-node handling
- BFS connected-component search

## Selection System

- Box select by dragging, move, rotate, delete, copy
- **Long-press** any machine to instantly enter move mode with offset preview
- **Rotate during move**: press R to rotate selected entities around their center
- All operations support real-time preview and collision/boundary detection

## Collision Detection

Real-time detection of all entity occupancy:

| Function | Purpose |
|----------|---------|
| `detectOnPlaceMachine` | Machine vs. existing entities (supports rotated mask) |
| `detectOnPlaceNode` | Single node (belt/pipe) vs. existing entities |
| `detectOnPlaceBatch` | Belt/Pipe batch placement vs. entity/port/node |
| `detectOnPlaceFinalIsPort` | Port type + direction matching (respects input port direction) |
| `detectOnPlaceFinalIsNode` | Node direction matching |
| `detectOnMoveMask` | Selection move vs. entity overlap |
| `checkMachineBounds` | Scene boundary clamp check (respects rotated dimensions) |

## Viewport Navigation

- **Drag** to pan the viewport (disabled during active editing to avoid conflict)
- **Mouse wheel** to zoom in/out, centered on cursor position
- Scene boundary clamping prevents scrolling outside the grid

## Indicator System

| Indicator | Description |
|-----------|-------------|
| Place | Placement preview mask |
| Conflict | Red overlay for collision area |
| Hover | Entity highlight on mouse hover |
| Select | Box selection rectangle |
| Move | Offset preview during selection move |

## Configuration Loader

The `core_loader` module handles loading external configuration data:

- Machine type definitions (dimensions, ports, masks, textures) — loaded from `data.json`
- **Machine anchor & mask injection**: `machines_1_4.json` is auto-loaded at startup; `anchor` and `mask` arrays are injected into `ResourcesStore.machines`, and full machine definitions (including `gridWidth`, `gridHeight`) are injected into `MachineStore.machineTypes`
- **Blacklist filtering**: machines listed in a configurable blacklist (e.g. `gas_pump_1`) are excluded from injection
- Arrow textures (`arrow_up/down/left/right`) loaded as part of the standard texture system for port direction indicators

---

# Architecture

```
Application
│
├── Stores          Pinia state management
├── Storage         Grid mapping / entity storage
├── Sub             Business logic orchestration
├── Stage           Pixi rendering layer
├── Container       Pixi entity wrapper
├── Middleware      Utilities, algorithms, conflict detection
├── Loader          External config & asset loading
└── Graphic         Reusable graphic components
```

The project follows a unidirectional dependency principle — lower layers never depend on higher layers:

```
Stores
  ↑
Storage
  ↑
Middleware
  ↑
Sub
  ↑
Stage
```

---

# Rendering Hierarchy

```
Viewport (Pixi Container with scroll/zoom)
├── Background Grid
├── Belt Layer
├── Pipe Layer
├── Machine Layer
└── Indicator / Overlay Layer (conflict, hover, selection masks)
```

All rendering is managed via Pixi.js Containers, re-parented under the viewport for unified coordinate transformation.

---

# Directory Structure

```
src/
├── components/            Vue pages
├── stores/                Pinia state management
├── core_stage/            Pixi rendering layer
├── core_container_sub/    Pixi Container wrappers
├── core_sub/              Entity business logic (Indicator, Machine, Belt, Pipe, Drag, Scale)
├── core_storage/          Grid spatial mapping & entity lookup
├── core_middleware/       Utilities, algorithms, conflict detection
├── core_graphic/          Reusable graphic components (hover, indicator, select)
├── core_loader/           External config loader
└── assets/                Static resources
```

---

# Keyboard Shortcuts

| Key | Action |
|------|--------|
| E | Place Belt |
| Q | Place Pipe |
| X | Box Select |
| M | Move selection |
| R | Rotate (preview / selection during move) |
| F | Delete selection |
| Ctrl + C | Copy selection |
| Esc | Cancel / exit current mode |
| Scroll | Zoom in/out |
| Drag | Pan viewport |

---

# Quick Start

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Production build
pnpm build

# Preview
pnpm preview
```

---

# Configuration

Default configuration is located in `stores/StorageStore.js`, including:

- Scene dimensions
- Grid count (columns × rows)
- Cell size
- Background color

Machine type definitions are loaded via `core_loader/LoadConfigs.js` at startup into `MachineStore`.

All grid dimensions are calculated automatically, no manual maintenance required.

---

# Tech Stack

- Vue 3
- Pixi.js 8
- Pinia
- Vite

---

# Design Philosophy

SimulationEngine adopts a **data-driven** design philosophy. All entities maintain independent data models, and the rendering layer is only responsible for display.

This architecture provides:

- High maintainability and extensibility
- Full decoupling of business logic and rendering
- Easier Undo / Redo implementation
- Easier multiplayer sync and serialization
- Clean separation of concerns across 7+ layers

---

# License

MIT License
