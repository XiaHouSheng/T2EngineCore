<div align="center">

# SimulationEngine

**A grid-based factory logistics simulation engine built with Vue 3 + Pixi.js**

支持机器、传送带、管道等实体编辑，提供实时碰撞检测、端口连接、框选编辑及可视化交互能力。

[English](./README.md) | 简体中文

![Vue](https://img.shields.io/badge/Vue_3-4FC08D?logo=vuedotjs&logoColor=white)
![Pixi](https://img.shields.io/badge/Pixi.js_8-E01E5A?logo=pixijs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=black)

</div>

---

# 概览

SimulationEngine 是一个面向工厂物流类游戏的二维网格仿真引擎。采用**数据驱动 + 分层架构**设计，渲染、业务、存储完全解耦。

---

# 功能特性

## 机器系统

- Mask 矩阵描述机器占地
- 任意角度（90°）旋转，自动宽高交换与锚点切换
- Belt / Pipe 四方向端口（`bo`/`bi`/`po`/`pi`）
- Hover 高亮反馈

## 传送带与管道系统

两套系统采用统一架构设计：

- 单段放置 / 连续铺设
- 自动 L 型路径（垂直优先 / 水平优先）
- 自动连接机器端口
- 同格覆写与交叉节点处理
- BFS 连通域搜索

## 框选系统

- 框选、移动、旋转、删除、复制
- 所有编辑过程均支持实时预览与冲突检测

## 碰撞检测

实时检测所有实体占用情况：

- 放置预检测（`detectOnPlaceBatch`）
- 端口类型与方向匹配放行（`detectOnPlaceFinalIsPort`）
- 节点方向匹配放行（`detectOnPlaceFinalIsNode`）
- 覆写放行
- 批量实体检测

## 指示器系统

| 指示器 | 说明 |
|-----------|-------------|
| Place | 放置预览 |
| Conflict | 冲突区域 |
| Hover | 鼠标悬停 |
| Port | 端口高亮 |
| Select | 框选区域 |

---

# 架构

```
Application
│
├── Stores          Pinia 状态管理
├── Storage         网格映射 / 实体存储
├── Sub             业务逻辑编排
├── Stage           Pixi 渲染层
├── Container       Pixi 实体封装
├── Middleware      工具与算法
└── Graphic         可复用图形组件
```

项目遵循单向依赖原则，低层永远不会依赖高层：

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

# 渲染层级

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

# 目录结构

```
src/
├── components/            Vue 页面
├── stores/                Pinia 状态管理
├── core_stage/            Pixi 渲染层
├── core_container_sub/    Pixi Container 封装
├── core_sub/              实体业务逻辑
├── core_storage/          网格映射
├── core_graphic/          图形组件
├── core_middleware/       工具与算法
└── assets/                资源
```

---

# 键盘快捷键

| 按键 | 功能 |
|------|--------|
| X | 框选 |
| E | 放置传送带 |
| Q | 放置管道 |
| M | 移动 |
| R | 旋转 |
| F | 删除 |
| Ctrl + C | 复制 |
| Esc | 取消 |

---

# 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build

# 预览
pnpm preview
```

---

# 配置

默认配置位于 `stores/StorageStore.js`，包括：

- 场景尺寸
- 网格数量
- 单元格大小
- 背景颜色

所有网格尺寸均自动计算，无需手动维护。

---

# 技术栈

- Vue 3
- Pixi.js 8
- Pinia
- Vite

---

# 设计理念

采用**数据驱动（Data Driven）**的设计理念。所有实体均维护独立的数据模型，渲染层仅负责展示。

这种架构带来了：

- 高可维护性、高扩展性
- 业务与渲染解耦
- 更容易实现 Undo / Redo
- 更容易支持多人同步与序列化

---

# 开源协议

MIT License
