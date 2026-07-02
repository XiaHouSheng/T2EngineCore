# SimulationEngine

基于 **Vue 3 + Pixi.js** 的工厂物流仿真引擎，提供网格化的工厂布局编辑与可视化能力。

## 技术栈

| 技术 | 用途 |
|------|------|
| [Vue 3](https://vuejs.org/) (Composition API) | 前端框架 |
| [Pinia](https://pinia.vuejs.org/) | 状态管理 |
| [Pixi.js](https://pixijs.com/) v8 | 2D 渲染引擎 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [nanoid](https://github.com/ai/nanoid) | 唯一 ID 生成 |

## 项目结构

```
SimulationEngine/
├── src/
│   ├── components/
│   │   └── Index.vue                    # 主视图组件（初始化场景）
│   │
│   ├── core_stage/                      # 渲染层 — Pixi.js 绘制
│   │   ├── SimStage.js                  # Pixi Application 与各层级容器
│   │   ├── SimInit.js                   # 场景初始化（网格线、交互层）
│   │   ├── MachineStage.js              # 机器绘制
│   │   ├── BeltStage.js                 # 传送带绘制
│   │   ├── PipeStage.js                 # 管道绘制
│   │   └── IndicatorStage.js            # 指示器绘制（高亮/路径预览）
│   │
│   ├── core_container_sub/              # 渲染子组件
│   │   ├── MachineContainer.js          # 机器容器（基于 mask 逐格绘制）
│   │   ├── BeltContainer.js             # 传送带容器
│   │   └── PipeContainer.js             # 管道容器
│   │
│   ├── core_sub/                        # 业务逻辑层 — 元素操作
│   │   ├── Machine.js                   # 机器：创建/放置/删除/旋转
│   │   ├── Belt.js                      # 传送带：创建/放置/批量铺设/旋转/删除
│   │   ├── Pipe.js                      # 管道：创建/放置/批量铺设/旋转/删除
│   │   └── Indicator.js                 # 指示器协调器（命令入口/状态管理/鼠标事件路由）
│   │
│   ├── core_storage/                    # 数据持久层 — 元素存储与查询
│   │   ├── MachineStorage.js            # 机器数据存储（基于 mask 的格子级存储）
│   │   ├── BeltStorage.js               # 传送带存储 + BFS 连通域查找
│   │   └── PipeStorage.js               # 管道存储 + BFS 连通域查找
│   │
│   ├── core_middleware/                 # 中间层 — 工具与辅助
│   │   ├── PositionConvert.js           # 网格坐标 ↔ 像素坐标转换
│   │   ├── KeyboardHandle.js            # 键盘事件 → 命令路由
│   │   ├── ConflictDetect.js            # 碰撞检测
│   │   └── UndoProxy.js                 # 撤销代理
│   │
│   ├── core_graphic/                    # 可复用的 Pixi.js 图形类
│   │   └── IndicatorGraphic.js          # 指示器图形（可移动/可旋转的高亮矩形）
│   │
│   ├── stores/                          # Pinia 状态仓库
│   │   ├── StorageStore.js              # 场景配置 + 所有元素的位置映射
│   │   ├── MachineStore.js              # 机器类型定义（mask、锚点、端口配置）
│   │   ├── BeltStore.js                 # 传送带常量定义（类型、方向、旋转映射）
│   │   ├── PipeStore.js                 # 管道常量定义（类型、方向、旋转映射）
│   │   └── KeyBoardStore.js             # 键盘命令映射 + 命令处理函数注册
│   │
│   ├── App.vue                          # 根组件
│   ├── main.js                          # 入口文件
│   └── style.css                        # 全局样式
│
├── index.html
├── package.json
└── vite.config.js
```

## 核心设计

### 分层架构

```
业务逻辑层 (core_sub/)          — 创建/放置/删除/旋转等操作
    ↕ 调用
数据持久层 (core_storage/)      — 元素存储、连通域查找
    ↕ 读写
渲染层 (core_stage/)            — Pixi.js 渲染、容器管理
    ↕ 使用
状态层 (stores/)                — Pinia 响应式数据仓库

辅助层：
  core_middleware/              — 坐标转换、键盘路由、碰撞检测
  core_graphic/                 — 可复用 Pixi.js 图形类
```

### 场景层级结构（z-index 从低到高）

```
rootStage
  └── viewportContainer（可缩放根容器）
        ├── backgroundContainer    — 网格背景
        ├── beltRootContainer      — 传送带
        ├── pipeRootContainer      — 管道
        ├── machineRootContainer   — 机器
        └── indicatorContainer     — 指示器（交互层）
```

### 机器系统

- 每台机器使用 **`mask` 二维矩阵** 描述内部布局，每个格子的值标识该位置的组件类型（`ma`=机身, `bi`=传送带入, `bo`=传送带出, `pi`=管入, `po`=管出）
- 旋转采用 **数据驱动** 方案：旋转 mask 矩阵、交换 `gridWidth/gridHeight`、切换对应锚点，然后重新创建容器，避免在渲染层做旋转变换
- 锚点定义为数组 `[anchor_0°, anchor_90°]`，支持长方形机器的两种旋转姿态

### 传送带/管道系统

- Belt 与 Pipe 结构完全镜像，共享同一套设计模式
- 支持逐条创建与 **批量铺设**（自动计算路径、中间转折点）
- 存储格式为 `"${id}.${inDirection}.${outDirection}"`，记录方向信息
- 支持 **连通域查找**（BFS）：从任意元素出发，沿 `out → in` 方向遍历整条链路，用于批量删除

### 键盘命令系统

- 分层设计：`KeyBoardStore`（映射定义）→ `KeyboardHandle`（路由分发）→ `Indicator`（协调执行）
- 支持**基命令**（如 `SELECT`/`PLACE_BELT`）和**子命令**（如 `ROTATE`/`MOVE`），按顺序组合触发复合操作
- 子命令可重复触发，基命令去重，`ESC` 取消当前命令

### 指示器系统

- `Indicator.js` 为总控协调器，维护回调队列 + 命令状态，鼠标事件由 `SimInit` 的 hitArea 捕获后路由至此
- `IndicatorStage.js` 提供高亮绘制能力（单格 / 多格批量 / 路径预览），支持直线和 L 形折线模式
- `IndicatorGraphic` 为可复用的高亮矩形 Graphic，支持 `moveToGrid` 重新定位

### 网格系统

- 默认场景尺寸：`600 × 600` 像素
- 默认网格：`10 × 10` 格
- 每格尺寸由 `cellWidth = width / colCount`、`cellHeight = height / rowCount` 动态计算
- 坐标转换通过 `PositionConvert.js` 的 `gridToPixel()` / `pixelToGrid()` 实现

## 使用

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 开发状态

| 模块 | 状态 |
|------|------|
| 网格渲染 | ✅ 已完成 |
| 机器创建/放置/删除 | ✅ 已完成 |
| 机器旋转（数据驱动） | ✅ 已完成 |
| 传送带单条创建/删除 | ✅ 已完成 |
| 传送带批量铺设 | ✅ 已完成 |
| 传送带连通域 BFS 查找 | ✅ 已完成 |
| 传送带旋转 | ✅ 已完成 |
| 管道系统（创建/删除/批量/BFS） | ✅ 已完成 |
| 指示器/高亮系统 | ✅ 已完成 |
| 键盘命令系统 | ✅ 已完成 |
| 碰撞检测 | ⏳ 待实现 |
| 撤销/重做 | ⏳ 待实现 |
| 用户交互（点击放置/选择/拖拽） | ⏳ 待实现 |
