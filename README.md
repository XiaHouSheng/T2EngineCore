

# SimulationEngine

工厂物流仿真引擎 — 网格化布局编辑 · 实体管理 · 实时可视化

**Vue 3** · **Pixi.js 8** · **Pinia**



[![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?logo=vue.js&logoColor=fff)](https://vuejs.org/)
[![Pixi.js 8](https://img.shields.io/badge/Pixi.js_8-E01E5A?logo=pixi.js&logoColor=fff)](https://pixijs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=000)](https://pinia.vuejs.org/)



---

## Quick Start

```bash
pnpm install
pnpm dev        # 开发 → http://localhost:5173
pnpm build      # 生产构建
pnpm preview    # 预览构建产物
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  📦 Stores                 Pinia 状态层 (无项目依赖)    │
│  StorageStore · MachineStore · BeltStore · PipeStore    │
├─────────────────────────────────────────────────────────┤
│  🗄️ Storage               实体数据持久化 (→ Stores)     │
│  MachineStorage · BeltStorage · PipeStorage             │
├─────────────────────────────────────────────────────────┤
│  ⚙️ Sub                   业务编排层                    │
│  Machine · Belt · Pipe · Indicator                     │
├──────────────┬──────────────────────────┬───────────────┤
│  🎨 Stage    │  🔲 Container Sub        │  📐 Graphic  │
│  Pixi 渲染   │  容器封装                │  可复用图形  │
│  MachineStage │  MachineContainer       │  Indicator   │
│  BeltStage   │  BeltContainer           │  SelectBox   │
│  PipeStage   │  PipeContainer           │              │
├──────────────┴──────────────────────────┴───────────────┤
│  🔧 Middleware           工具层 (坐标/键盘/碰撞)        │
│  PositionConvert · KeyboardHandle · ConflictDetect      │
└─────────────────────────────────────────────────────────┘
```

### 分层原则

- **Stores** 不依赖任何项目文件，只依赖 Vue/Pinia
- **Middleware** 只向下依赖 Stores
- **Stage** 自包含，只依赖 Pixi 和自己的容器子层
- **Sub** 编排层，协调存储 + 渲染 + 中间件

### 渲染层级

```
viewportContainer (可缩放)
  ├── backgroundContainer   网格背景
  ├── beltRootContainer     传送带
  ├── pipeRootContainer     管道
  ├── machineRootContainer  机器
  └── indicatorContainer    指示器/遮罩 (最上层)
```

---

## Features

### 机器 (Machine)

```
mask 矩阵 → 数据驱动旋转 → 重建容器
```

- **mask 矩阵** — 二维网格描述机器内部布局（每格标识组件类型）
- **旋转** — mask 顺时针 90° + gridW/gridH 交换 + 锚点切换，全程数据驱动
- **锚点** — `[anchor_0°, anchor_90°]` 数组，适配长方形机器两种姿态
- **端口系统** — `portConfig` 定义四边端口 (`belt_in/out`·`pipe_in/out`)
  - 端口点击用 `sprite.toGlobal` 计算外部相邻格子，不受容器旋转影响

### 传送带 & 管道

- 结构对称，共享设计模式
- 支持逐条创建和**批量铺设**（自动 L 形路径）
- 存储格式: `"${id}.${inDir}.${outDir}"`
- **BFS 连通域** — 沿 `out → in` 遍历链路

### 选择系统

```
SELECT (框选) → scanGridByPixel → selectGraphics (Set 去重)
    │
    ├── MOVE    → delete原始 → masks跟随鼠标 → 冲突检测 → mousedown确认放置
    ├── ROTATE  → 以包围盒中心为基准旋转
    └── DELETE  → 删除选中实体
```

- 多次框选累加，Set 去重
- 移动/旋转用 **metaBackup 容灾**：取消时一键恢复

### 冲突检测

- **实时检测** — mousemove 时 `detectOnMoveMask` 检查目标位置
- **视觉反馈** — 冲突区域红色遮罩 (`conflictGraphics`)
- **拦截放置** — mousedown 时 `conflictGraphics.length > 0` 则拦截
- 旋转后的机器用 `centerX/Y` 计算占位，不受 `machine.x/y` 过期影响

### 键盘命令

| 键 | 命令 | 说明 |
|---|------|------|
| `x` | SELECT | 框选模式 |
| `e` | PLACE_BELT | 传送带放置 |
| `q` | PLACE_PIPE | 管道放置 |
| `ESC` | CANCEL | 取消/退出 |
| `m` | MOVE | 移动选中 |
| `r` | ROTATE | 旋转选中 |
| `f` | DELETE | 删除选中 |

分层路由: `KeyBoardStore(定义) → KeyboardHandle(分发) → Indicator(执行)`

---

## Project Structure

```
src/
├── components/        Vue 主视图
├── stores/            Pinia 状态 · 场景配置 · 类型定义
├── core_stage/        Pixi 渲染层 · 绘制/移除
├── core_sub/          业务编排层 · 实体 CRUD · 交互控制
├── core_storage/      数据持久层 · 网格映射 · 连通域
├── core_middleware/   工具层 · 坐标 · 键盘 · 碰撞
├── core_container_sub/  Pixi 容器封装 · 端口交互
├── core_graphic/      可复用图形类 · 高亮 · 选框
└── assets/            静态资源
```

---

## Configuration

| 参数 | 默认值 | 说明 |
|------|--------|------|
| 场景宽高 | `600 × 600` | 像素 |
| 网格数 | `10 × 10` | 行列 |
| 背景色 | `0xffffff` | 白色 |

配置集中在 `StorageStore`，`cellWidth` / `cellHeight` 自动计算。

---

## Status

| 模块 | |
|------|---|
| 场景初始化 (网格 + 交互捕获) | ✅ |
| 机器 CRUD / 旋转 / 端口系统 | ✅ |
| 传送带 (单条/批量/连通域/旋转) | ✅ |
| 管道系统 | ✅ |
| 指示器 / 高亮 / 选框 | ✅ |
| 键盘命令路由 | ✅ |
| 框选 / 选中高亮 / 移动 / 旋转 / 删除 | ✅ |
| 碰撞检测 | ✅ |
| 撤销 / 重做 | ⏳ |
