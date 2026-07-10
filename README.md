<div align="center">

# SimulationEngine

**工厂物流仿真引擎** — 网格化布局编辑 · 实体管理 · 实时可视化

[![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?logo=vue.js&logoColor=fff)](https://vuejs.org/)
[![Pixi.js 8](https://img.shields.io/badge/Pixi.js_8-E01E5A?logo=pixi.js&logoColor=fff)](https://pixijs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=000)](https://pinia.vuejs.org/)

</div>

---

## Quick Start

```bash
pnpm install
pnpm dev        # → http://localhost:5173
pnpm build      # 生产构建
pnpm preview    # 预览构建产物
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Stores              Pinia 状态层 (零项目依赖)                   │
│  StorageStore · MachineStore · BeltStore · PipeStore            │
├──────────────────────────────────────────────────────────────────┤
│  Storage             实体持久化 · 网格映射                        │
│  MachineStorage · BeltStorage · PipeStorage                     │
├──────────────────────────────────────────────────────────────────┤
│  Sub                 业务编排层                                  │
│  Machine · Belt · Pipe · Indicator                              │
├──────────────────────┬───────────────────────────────────────────┤
│  Stage               │  Container Sub                           │
│  Pixi 渲染层         │  Pixi 容器封装                           │
│  SimStage · SimInit  │  MachineContainer                        │
│  MachineStage        │  BeltContainer                           │
│  BeltStage           │  PipeContainer                           │
│  PipeStage           │                                          │
│  IndicatorStage      │                                          │
├──────────────────────┴───────────────────────────────────────────┤
│  Middleware          工具层                                      │
│  PositionConvert · KeyboardHandle · ConflictDetect              │
│  GridRegistry · UndoProxy                                       │
├──────────────────────────────────────────────────────────────────┤
│  Graphic             可复用图形类                                 │
│  IndicatorGraphic · SelectGraphic                               │
└──────────────────────────────────────────────────────────────────┘
```

### 分层原则

- **Stores** → 只依赖 Vue/Pinia，不引用项目文件
- **Storage / Middleware / Graphic** → 只向下依赖 Stores
- **Sub** → 编排层，协调存储 + 渲染 + 中间件
- **Stage / Container Sub** → 自包含，只依赖 Pixi.js

### 渲染层级

```
viewportContainer (可缩放/拖拽)
  ├── backgroundContainer   网格背景
  ├── beltRootContainer     传送带
  ├── pipeRootContainer     管道
  ├── machineRootContainer  机器
  └── indicatorContainer    指示器/遮罩 (顶层)
```

---

## Features

### 机器

- **mask 矩阵** — 二维网格描述机器内部布局，旋转 = 矩阵顺时针 90° + 宽高交换 + 锚点切换，全程数据驱动
- **端口系统** — 四边定义 `belt_in/out` · `pipe_in/out`，点击端口自动计算外部相邻格和连接方向
- **旋转适配** — 端口用 `sprite.toGlobal` 计算世界坐标，不受容器旋转影响

### 传送带 & 管道

- 结构对称，共享管线模式。支持逐条创建和**批量铺设**（自动 L 形路径拐弯）
- **连续铺接** — 上一段铺设的末尾方向作为下一段的导入方向，冲突检测放行起点覆写
- **BFS 连通域** — 沿 `out → in` 遍历链路

### 选择系统

```
选择 → 框选累加 (Set去重)
  │
  ├─ MOVE    → 备份 → 删除原始 → 实时偏移 + 碰撞检测 → 确认放置
  ├─ ROTATE  → 以包围盒中心为基准旋转
  ├─ COPY    → 备份 → 删除原始 → 偏移 → 放置 (生成新ID)
  └─ DELETE  → 直接删除
```

- **metaBackup 容灾** — 移动/旋转/复制前备份，取消操作时一键恢复原始位置

### 冲突检测

- **实时检查** — mousemove 时检测目标位置，冲突区域红色遮罩
- **拦截放置** — mousedown 时 `conflictGraphics.length > 0` 则拦截
- **覆写放行** — 连续铺设时允许起点格覆写，额外冲突仍拦截

### 键盘命令

| 键 | 命令 | 说明 |
|---|------|------|
| `x` | SELECT | 框选模式 |
| `e` | PLACE_BELT | 传送带放置 |
| `q` | PLACE_PIPE | 管道放置 |
| `Esc` | CANCEL | 取消/退出 |
| `m` | MOVE | 移动选中 |
| `r` | ROTATE | 旋转选中 |
| `f` | DELETE | 删除选中 |
| `Ctrl+C` | COPY | 复制选中 |

命令路由：`KeyBoardStore(定义) → KeyboardHandle(分发) → Indicator(执行)`

---

## Project Structure

```
src/
├── components/             Vue 主视图 (Index.vue)
├── stores/                 Pinia 状态 · 场景配置 · 类型定义
│   ├── StorageStore.js     场景尺寸 · 实体元数据容器
│   ├── MachineStore.js     机器类型定义
│   ├── BeltStore.js        传送带状态管理
│   ├── PipeStore.js        管道状态管理
│   └── KeyBoardStore.js    键盘命令映射
├── core_stage/             Pixi 渲染层
│   ├── SimStage.js         根舞台容器初始化
│   ├── SimInit.js          网格线绘制 · 交互捕获区域
│   ├── MachineStage.js     机器渲染管理
│   ├── BeltStage.js        传送带渲染管理
│   ├── PipeStage.js        管道渲染管理
│   └── IndicatorStage.js   指示器渲染管理
├── core_sub/               实体编排 · 交互控制
│   ├── Machine.js          机器实体逻辑
│   ├── Belt.js             传送带实体逻辑
│   ├── Pipe.js             管道实体逻辑
│   └── Indicator.js        交互指示器控制
├── core_storage/           实体存取 · 网格映射
│   ├── MachineStorage.js   机器存储管理
│   ├── BeltStorage.js      传送带存储管理
│   └── PipeStorage.js      管道存储管理
├── core_container_sub/     Pixi 容器封装 (端口交互)
│   ├── MachineContainer.js 机器容器封装
│   ├── BeltContainer.js    传送带容器封装
│   └── PipeContainer.js    管道容器封装
├── core_graphic/           可复用图形类
│   ├── IndicatorGraphic.js 指示器图形 (高亮/冲突)
│   └── SelectGraphic.js    选框图形
├── core_middleware/        工具层
│   ├── PositionConvert.js  像素/网格坐标转换
│   ├── KeyboardHandle.js   键盘命令分发
│   ├── ConflictDetect.js   碰撞检测
│   ├── GridRegistry.js     网格实体查询 (按像素/区域扫描)
│   └── UndoProxy.js        撤销代理
└── assets/                 静态资源
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

| 模块 | 状态 |
|------|------|
| 场景初始化 (网格 + 交互捕获) | ✅ |
| 机器 CRUD / 旋转 / 端口系统 | ✅ |
| 传送带 (单条/批量/连通域/旋转) | ✅ |
| 管道系统 | ✅ |
| 键盘命令路由 | ✅ |
| 框选 + 移动 + 旋转 + 删除 + 复制 | ✅ |
| 碰撞检测 (实时 + 拦截) | ✅ |
| 网格实体查询 (GridRegistry) | ✅ |
| 撤销 / 重做系统 (UndoProxy) | ⏳ |