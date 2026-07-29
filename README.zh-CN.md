<div align="center">

# SimulationEngine

**基于 Vue 3 + Pixi.js 的网格化工厂物流仿真引擎**

支持机器、传送带、管道的实体编辑操作，提供实时碰撞检测、端口连接、框选编辑、视口导航与可视化交互能力。

[English](./README.md) | 简体中文

![Vue](https://img.shields.io/badge/Vue_3-4FC08D?logo=vuedotjs&logoColor=white)
![Pixi](https://img.shields.io/badge/Pixi.js_8-E01E5A?logo=pixijs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=black)

</div>

---

# 概览

SimulationEngine 是一个面向工厂物流类游戏的二维网格仿真引擎。采用**数据驱动 + 分层架构**设计，渲染、业务、存储完全解耦。实体配置通过外部 JSON 在启动时加载。

---

# 功能特性

## 机器系统

- **Mask 矩阵**描述机器占地，支持任意形状
- 90° 旋转，自动宽高交换与锚点切换
- 四方向端口：`bi`（传送带输入）、`bo`（传送带输出）、`pi`（管道输入）、`po`（管道输出）
- **放置流程**：选择类型 → mask 跟随鼠标实时预览冲突/边界 → 点击放置
- Hover 高亮与配方图标叠加（双列输入/输出布局）

## 传送带与管道系统

两套系统采用统一架构设计：

- 单次放置 / 连续铺设
- **节点放置**：split、merge、cross 节点，支持方向配置
- 放置前可按 R 旋转节点
- 自动 L 型路径连接机器端口
- 同格覆写与交叉节点处理
- BFS 连通域搜索

## 框选系统

- 框选、移动、旋转、删除、复制
- 长按机器直接进入移动模式，实时偏移预览
- 移动中按 R 键绕选中实体中心旋转
- 所有操作支持实时碰撞与边界检测

## 碰撞检测

| 函数 | 用途 |
|------|------|
| `detectOnPlaceMachine` | 机器 vs 已有实体（支持旋转后的 mask） |
| `detectOnPlaceBatch` | 带/管批量放置 vs 实体/端口/节点 |
| `detectOnPlaceNode` | 单节点放置冲突检测 |
| `detectOnPlaceFinalIsPort` | 端口类型 + 方向匹配 |
| `detectOnPlaceFinalIsNode` | 节点方向匹配 |
| `detectOnMoveMask` | 选中移动 vs 实体重叠 |
| `checkMachineBounds` | 场景边界检测 |

## 视口

- 拖拽平移（编辑时自动禁用）
- 鼠标滚轮缩放到光标位置
- 场景边界限制

## 指示器系统

预览 mask（蓝色）、冲突覆盖（红色）、实体 hover 高亮、框选矩形、移动偏移预览 — 通过 Pixi Graphics/Container 叠加层渲染，端口显示箭头方向贴图。

---

# 架构

```
Application
│
├── Stores          Pinia 状态管理
├── Storage         网格空间映射与实体查找
├── Sub             业务逻辑编排（Indicator、Machine、Belt、Pipe...）
├── Stage           Pixi 渲染层
├── Container       Pixi Container 封装（BeltContainer、MachineContainer...）
├── Middleware      工具函数、碰撞检测、坐标转换
├── Loader          外部配置与资源加载（JSON、纹理）
└── Graphic         可复用图形组件（指示器、hover、选框）
```

单向依赖：`Stores → Storage → Middleware → Sub → Stage`

---

# 快速开始

```bash
pnpm install
pnpm dev       # 开发模式
pnpm build     # 生产构建
pnpm preview   # 预览
```

---

# 技术栈

- **Vue 3** — UI 框架
- **Pixi.js 8** — Canvas 渲染（网格化）
- **Pinia** — 状态管理
- **Vite** — 构建工具
