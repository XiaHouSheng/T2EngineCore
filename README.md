<div align="center">

# SimulationEngine

**A grid-based factory logistics simulation engine built with Vue 3 + Pixi.js**

Supports editing of machines, conveyor belts, pipes and other entities, with real-time collision detection, port connection, box selection editing, and visual interaction.

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

- Mask matrix describes machine footprint
- 90° rotation with automatic width/height swap and anchor switching
- Belt / Pipe four-direction ports (`bo`/`bi`/`po`/`pi`)
- Hover highlight feedback

## Belt & Pipe System

Both systems share a unified architecture:

- Single-segment placement / continuous laying
- Auto L-shaped path (vertical-first / horizontal-first)
- Auto-connect to machine ports
- Same-cell overwrite and cross-node handling
- BFS connected-component search

## Selection System

- Box select, move, rotate, delete, copy
- All editing operations support real-time preview and collision detection

## Collision Detection

Real-time detection of all entity occupancy:

- Placement pre-check (`detectOnPlaceBatch`)
- Port type and direction matching (`detectOnPlaceFinalIsPort`)
- Node direction matching (`detectOnPlaceFinalIsNode`)
- Overwrite permission
- Batch entity detection

## Indicator System

| Indicator | Description |
|-----------|-------------|
| Place | Placement preview |
| Conflict | Conflict area |
| Hover | Mouse hover |
| Port | Port highlight |
| Select | Selection area |

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
├── Middleware      Utilities and algorithms
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
Viewport
├── Background
├── Belt Layer
├── Pipe Layer
├── Machine Layer
└── Indicator Layer
```

All rendering is managed via Pixi.js Containers.

---

# Directory Structure

```
src/
├── components/            Vue pages
├── stores/                Pinia state management
├── core_stage/            Pixi rendering layer
├── core_container_sub/    Pixi Container wrappers
├── core_sub/              Entity business logic
├── core_storage/          Grid mapping
├── core_graphic/          Graphic components
├── core_middleware/       Utilities and algorithms
└── assets/                Assets
```

---

# Keyboard Shortcuts

| Key | Action |
|------|--------|
| X | Select |
| E | Place Belt |
| Q | Place Pipe |
| M | Move |
| R | Rotate |
| F | Delete |
| Ctrl + C | Copy |
| Esc | Cancel |

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

- Scene Size
- Grid Count
- Cell Size
- Background Color

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
- Decoupling of business logic and rendering
- Easier Undo / Redo implementation
- Easier multiplayer sync and serialization

---

# License

MIT License
