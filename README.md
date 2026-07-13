<div align="center">

# SimulationEngine

**A grid-based factory logistics simulation engine built with Vue 3 + Pixi.js**

支持机器、传送带、管道等实体编辑，提供实时碰撞检测、端口连接、框选编辑及可视化交互能力。

![Vue](https://img.shields.io/badge/Vue_3-4FC08D?logo=vuedotjs&logoColor=white)
![Pixi](https://img.shields.io/badge/Pixi.js_8-E01E5A?logo=pixijs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=black)

</div>

---

# Overview

SimulationEngine 是一个面向工厂物流类游戏的二维网格仿真引擎。

它提供：

- 网格地图编辑
- 机器放置与旋转
- 传送带 / 管道铺设
- 自动端口连接
- 实时冲突检测
- 框选、移动、复制、删除
- Pixi.js 高性能渲染

整个项目采用**数据驱动 + 分层架构**设计，渲染、业务、存储完全解耦。

---

# Features

## Machine System

- Mask 矩阵描述机器占地
- 任意角度（90°）旋转
- 自动宽高交换
- 自动锚点切换
- Belt / Pipe 四方向端口
- Hover 高亮反馈

---

## Belt & Pipe System

两套系统采用统一架构设计。

支持：

- 单段放置
- 连续铺设
- 自动 L 型路径
- 自动连接机器端口
- 同格覆写
- BFS 连通域搜索

---

## Selection System

支持编辑器常见操作：

- 框选
- 移动
- 旋转
- 删除
- 复制

所有编辑过程均支持实时预览与冲突检测。

---

## Collision Detection

实时检测所有实体占用情况。

支持：

- 放置预检测
- 实时冲突高亮
- 端口放行
- 覆写放行
- 批量实体检测

---

## Indicator System

提供丰富的编辑反馈：

| Indicator | Description |
|-----------|-------------|
| Place | 放置预览 |
| Conflict | 冲突区域 |
| Hover | 鼠标悬停 |
| Port | 端口高亮 |
| Select | 框选区域 |

---

# Architecture

```
Application
│
├── Stores
│      Pinia 状态管理
│
├── Storage
│      网格映射 / 实体存储
│
├── Sub
│      业务逻辑编排
│
├── Stage
│      Pixi 渲染层
│
├── Container
│      Pixi 实体封装
│
├── Middleware
│      工具与算法
│
└── Graphic
       可复用图形组件
```

项目遵循单向依赖原则：

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

低层永远不会依赖高层。

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

所有渲染均基于 Pixi.js Container 管理。

---

# Directory Structure

```
src/

components/
    Vue 页面

stores/
    Pinia 状态管理

core_stage/
    Pixi 渲染层

core_container_sub/
    Pixi Container 封装

core_sub/
    实体业务逻辑

core_storage/
    网格映射

core_graphic/
    图形组件

core_middleware/
    工具与算法

assets/
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

Install dependencies

```bash
pnpm install
```

Development

```bash
pnpm dev
```

Production build

```bash
pnpm build
```

Preview

```bash
pnpm preview
```

---

# Configuration

默认配置位于：

```
stores/StorageStore.js
```

包括：

- Scene Size
- Grid Count
- Cell Size
- Background Color

所有网格尺寸均自动计算，无需手动维护。

---

# Current Status

| Module | Status |
|---------|--------|
| Scene | ✅ |
| Machine System | ✅ |
| Belt System | ✅ |
| Pipe System | ✅ |
| Selection | ✅ |
| Collision Detection | ✅ |
| Indicator | ✅ |
| Grid Registry | ✅ |

---

# Tech Stack

- Vue 3
- Pixi.js 8
- Pinia
- Vite

---

# Design Philosophy

SimulationEngine 采用**数据驱动（Data Driven）**的设计理念。

所有实体均维护独立的数据模型，渲染层仅负责展示。

这种架构带来了：

- 高可维护性
- 高扩展性
- 业务与渲染解耦
- 更容易实现 Undo / Redo
- 更容易支持多人同步与序列化

---

# License

MIT License