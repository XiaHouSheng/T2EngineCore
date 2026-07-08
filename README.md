# SimulationEngine

基于 **Vue 3 + Pixi.js 8** 的工厂物流仿真引擎，提供网格化的工厂布局编辑、实体管理与可视化能力。

## 技术栈

| 技术 | 用途 |
|------|------|
| [Vue 3](https://vuejs.org/) (Composition API) | 前端框架 |
| [Pinia](https://pinia.vuejs.org/) | 状态管理 |
| [Pixi.js](https://pixijs.com/) v8 | 2D 渲染引擎 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [nanoid](https://github.com/ai/nanoid) | 唯一 ID 生成 |

## 快速开始

```bash
pnpm install
pnpm dev      # 开发服务器
pnpm build    # 生产构建
pnpm preview  # 预览生产版本
```

## 项目结构

```
SimulationEngine/
├── src/
│   ├── components/
│   │   └── Index.vue                         # 主视图组件（初始化场景）
│   │
│   ├── core_stage/                           # 渲染层 — PixiJS 绘制
│   │   ├── SimStage.js                       # Application + 层级容器
│   │   ├── SimInit.js                        # 网格线 + hitArea 交互捕获
│   │   ├── MachineStage.js                   # 机器：绘制/移除
│   │   ├── BeltStage.js                      # 传送带：绘制/移除
│   │   ├── PipeStage.js                      # 管道：绘制/移除
│   │   └── IndicatorStage.js                 # 指示器：高亮/路径预览/框选遮罩
│   │
│   ├── core_sub/                             # 业务逻辑层 — 实体操作
│   │   ├── Machine.js                        # 机器 CRUD + 旋转
│   │   ├── Belt.js                           # 传送带 CRUD + 批量铺设 + 旋转
│   │   ├── Pipe.js                           # 管道 CRUD + 批量铺设 + 旋转
│   │   └── Indicator.js                      # 交互控制器（事件路由 + 命令状态 + 选择/移动/旋转）
│   │
│   ├── core_storage/                         # 数据持久层 — Pinia Store 读写
│   │   ├── MachineStorage.js                 # 机器存储（mask 格子级映射、连通域查询）
│   │   ├── BeltStorage.js                    # 传送带存储 + BFS 连通域查找
│   │   └── PipeStorage.js                    # 管道存储 + BFS 连通域查找
│   │
│   ├── core_middleware/                      # 中间层
│   │   ├── PositionConvert.js                # 网格 ↔ 像素坐标转换
│   │   ├── GridRegistry.js                   # 空间查询（像素级实体检索）
│   │   ├── KeyboardHandle.js                 # 键盘事件路由
│   │   ├── ConflictDetect.js                 # 碰撞检测（待实现）
│   │   └── UndoProxy.js                      # 撤销代理（待实现）
│   │
│   ├── core_container_sub/                   # PixiJS 实体容器
│   │   ├── MachineContainer.js               # 机器容器（含端口系统 + 点击交互）
│   │   ├── BeltContainer.js                  # 传送带容器
│   │   └── PipeContainer.js                  # 管道容器
│   │
│   ├── core_graphic/                         # 可复用 PixiJS 图形类
│   │   ├── IndicatorGraphic.js               # 高亮方块（支持 moveToGrid）
│   │   └── SelectGraphic.js                  # 框选框图形
│   │
│   ├── stores/                               # Pinia 状态库
│   │   ├── StorageStore.js                   # 场景配置 + 所有元素的位置映射
│   │   ├── MachineStore.js                   # 机器类型定义（mask、锚点、端口配置）
│   │   ├── BeltStore.js                      # 传送带常量（方向、旋转映射）
│   │   ├── PipeStore.js                      # 管道常量（方向、旋转映射）
│   │   └── KeyBoardStore.js                  # 键盘命令映射 + 处理函数注册
│   │
│   ├── assets/resources/                     # 静态资源
│   ├── App.vue
│   ├── main.js
│   └── style.css
│
├── index.html
├── package.json
└── vite.config.js
```

## 架构设计

### 分层架构

```
Vue 组件 (components/Index.vue)
    │
    ▼
控制器 (core_sub/Indicator.js) — 事件路由 + 命令状态管理
    │
    ├──▶ 业务逻辑 (core_sub/Machine / Belt / Pipe)
    │       ├──▶ 存储 (core_storage/*)         — 读写 Pinia Store
    │       ├──▶ 渲染 (core_stage/*)           — 绘制/移除 Container
    │       └──▶ 碰撞检测 (core_middleware/ConflictDetect)
    │
    ├──▶ 中间件 (core_middleware/*)
    │       ├── PositionConvert  — 坐标转换
    │       ├── GridRegistry     — 空间查询
    │       └── KeyboardHandle   — 键盘分发
    │
    └──▶ 实体容器 (core_container_sub/*)
            └── 继承 Pixi.js Container，封装内部子元素
```

### 场景层级（z-index 从低到高）

```
rootStage
  └── viewportContainer（可缩放）
        ├── backgroundContainer     — 网格背景
        ├── beltRootContainer       — 传送带
        ├── pipeRootContainer       — 管道
        ├── machineRootContainer    — 机器
        └── indicatorContainer      — 指示器（高亮/框选/遮罩）
```

### 事件调度

```
用户输入 → SimInit.js hitArea (PIXI 事件)
    ↓ { client.x/y, gridX/Y }
Indicator.js onMouseDown / Move / Up
    ↓ 回调队列 dispatch
queue.mousedown[name] / mousemove[name] / mouseup[name]
    ↓
各命令的回调（placeBelt / select / move / rotate ...）
```

每次进入新命令通过 `onCancel()` 清空队列，确保同时只有一种命令模式。

### 实体系统

三种实体（Machine / Belt / Pipe）遵循相同的模块模式：

```
core_sub/Entity.js          — 业务逻辑（create / place / delete / rotate）
core_stage/EntityStage.js   — 渲染（draw / dropDraw）
core_storage/EntityStorage.js — 数据持久化（save / drop / query）
core_container_sub/EntityContainer.js — PixiJS 容器封装
```

#### 机器 (Machine)

- 使用 **`mask` 二维矩阵** 描述内部布局，每格标识组件类型
- 旋转采用 **数据驱动**：旋转 mask 矩阵 → 交换 gridWidth/Height → 切换锚点 → 重建容器
- 锚点定义为 `[anchor_0°, anchor_90°]` 数组，支持长方形机器的两种姿态
- **端口系统**：`portConfig` 定义四边端口位置和类型（`belt_in` / `belt_out` / `pipe_in` / `pipe_out`）
  - 端口点击时通过 `sprite.toGlobal` 计算外部相邻格子的坐标和连接方向，支持机器旋转后的正确映射

#### 传送带 / 管道

- Belt 与 Pipe 结构对称，共享设计模式
- 支持逐条创建与 **批量铺设**（自动计算 L 形路径）
- 存储格式：`"${id}.${inDir}.${outDir}"`，记录连接方向
- 支持 **BFS 连通域查找**：沿 `out → in` 遍历链路

### 键盘命令系统

分层映射：`KeyBoardStore`（定义）→ `KeyboardHandle`（路由）→ `Indicator`（执行）

| 键 | 命令 | 说明 |
|----|------|------|
| `x` | SELECT | 进入框选模式 |
| `e` | PLACE_BELT | 进入传送带放置模式 |
| `q` | PLACE_PIPE | 进入管道放置模式 |
| `Escape` | CANCEL | 取消当前操作 |
| `m` | (子命令) MOVE | 移动选中实体 |
| `r` | (子命令) ROTATE | 旋转选中实体 |
| `f` | (子命令) DELETE | 删除选中实体 |

子命令可重复触发，ESC 取消当前模式。

### 选择系统

```
SELECT → 框选 → scanGridByPixel → drawMaskSelectArea → selectGraphics
    │
    ├── MOVE    → delete 原始 → masks 跟随鼠标 → mousedown 确认放置
    ├── ROTATE  → 以选中实体包围盒中心为基准旋转
    └── DELETE  → 删除选中实体
```

支持多次框选累加（Set 去重）。

## 配置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| 场景宽高 | `600 × 600` | 像素 |
| 网格数 | `10 × 10` | 行列 |
| 背景色 | `0xffffff` | 白色 |

配置集中在 `StorageStore`，修改后 `cellWidth` / `cellHeight` 自动计算。

## 开发状态

| 模块 | 状态 |
|------|------|
| 场景初始化（网格 + 交互捕获） | ✅ |
| 机器：创建/放置/删除/旋转 | ✅ |
| 机器：端口系统 + 点击交互 | ✅ |
| 传送带：单条/批量创建 | ✅ |
| 传送带：BFS 连通域 | ✅ |
| 传送带：旋转 | ✅ |
| 管道系统（对称实现） | ✅ |
| 指示器/高亮系统 | ✅ |
| 键盘命令路由 | ✅ |
| 框选 + 选中高亮 | ✅ |
| 选中后移动 | ✅ |
| 选中后旋转 | ✅ |
| 碰撞检测 | ⏳ 待实现 |
| 撤销/重做 | ⏳ 待实现 |
