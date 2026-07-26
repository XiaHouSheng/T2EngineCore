<div align="center">

# SimulationEngine

**基于 Vue 3 + Pixi.js 的网格化工厂物流仿真引擎**

支持机器、传送带、管道等实体的编辑操作，提供实时碰撞检测、端口连接、框选编辑、视口导航与可视化交互能力。

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

- Mask 矩阵描述机器占地，支持任意形状
- 90° 旋转，自动宽高交换与锚点切换
- 带/管四方向端口（`bo`/`bi`/`po`/`pi`）
- **放置流程**：点击机器按钮 → mask 跟随鼠标实时预览冲突/边界 → 点击确认放置
- **放置旋转**：放置过程中按 R 键旋转预览 mask
- Hover 高亮反馈

## 传送带与管道系统

两套系统采用统一架构设计：

- 单段放置 / 连续铺设
- 自动 L 型路径（垂直优先 / 水平优先切换）
- 自动连接机器端口
- 同格覆写与交叉节点处理
- BFS 连通域搜索

## 框选系统

- 框选、移动、旋转、删除、复制
- **长按机器**：直接进入移动模式，实时偏移预览
- **移动中旋转**：按 R 键绕选中实体中心旋转
- 所有操作支持实时碰撞与边界检测

## 碰撞检测

实时检测所有实体的占用情况：

| 函数 | 用途 |
|------|------|
| `detectOnPlaceMachine` | 机器 vs 已有实体（支持旋转后的 mask） |
| `detectOnPlaceBatch` | 带/管批量放置 vs 实体/端口/节点 |
| `detectOnPlaceFinalIsPort` | 端口类型 + 方向匹配（支持输入端口方向反转） |
| `detectOnPlaceFinalIsNode` | 节点方向匹配 |
| `detectOnMoveMask` | 选中移动 vs 实体重叠 |
| `checkMachineBounds` | 场景边界检测（考虑旋转后尺寸） |

## 视口导航

- **拖拽**平移视口（编辑模式下自动禁用，避免冲突）
- **鼠标滚轮**缩放，以光标位置为中心
- 场景边界限制，防止越界

## 指示器系统

| 指示器 | 说明 |
|-----------|-------------|
| Place | 放置预览 mask |
| Conflict | 冲突区域红色覆盖 |
| Hover | 鼠标悬停高亮 |
| Select | 框选矩形区域 |
| Move | 移动中 offset 预览 |

## 配置加载器

`core_loader` 模块负责加载外部配置数据：

- 机器类型定义（尺寸、端口、mask、纹理）
- 支持 JSON 文件加载，未来可扩展其他格式

---

# 架构

```
Application
│
├── Stores          Pinia 状态管理
├── Storage         网格映射 / 实体存储
├── Sub             业务逻辑编排（指示器、实体操作）
├── Stage           Pixi 渲染层
├── Container       Pixi Container 封装
├── Middleware      工具函数、碰撞检测算法
├── Loader          外部配置与资源加载
└── Graphic         可复用图形组件（hover、指示器、选框）
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
Viewport（可滚动/缩放的 Pixi Container）
├── 背景网格
├── 传送带层
├── 管道层
├── 机器层
└── 指示器/叠加层（冲突、hover、选中、移动 mask）
```

所有渲染均基于 Pixi.js Container 管理，重父级到 viewport 下实现统一坐标变换。

---

# 目录结构

```
src/
├── components/            Vue 页面
├── stores/                Pinia 状态管理
├── core_stage/            Pixi 渲染层
├── core_container_sub/    Pixi Container 封装
├── core_sub/              实体业务逻辑（Indicator、Machine、Belt、Pipe、Drag、Scale）
├── core_storage/          网格空间映射与实体查找
├── core_middleware/       工具函数与碰撞检测算法
├── core_graphic/          可复用图形组件（hover、指示器、选框）
├── core_loader/           外部配置加载器
└── assets/                静态资源
```

---

# 键盘快捷键

| 按键 | 功能 |
|------|--------|
| E | 放置传送带 |
| Q | 放置管道 |
| X | 框选 |
| M | 移动选中 |
| R | 旋转（预览 / 移动中选中） |
| F | 删除选中 |
| Ctrl + C | 复制选中 |
| Esc | 取消 / 退出当前模式 |
| 滚轮 | 缩放 |
| 拖拽 | 平移视口 |

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
- 网格数量（列 × 行）
- 单元格大小
- 背景颜色

机器类型定义通过 `core_loader/LoadConfigs.js` 在启动时加载到 `MachineStore`。

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
- 业务与渲染完全解耦
- 更容易实现 Undo / Redo
- 更容易支持多人同步与序列化
- 7+ 层级的清晰关注点分离

---

# 开源协议

MIT License
