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
│   │   ├── GridStage.js                 # 网格线绘制
│   │   ├── MachineStage.js              # 机器绘制
│   │   ├── BeltStage.js                 # 传送带绘制
│   │   ├── PipeStage.js                 # 管道绘制（待实现）
│   │   └── IndicatorStage.js            # 指示器绘制（待实现）
│   │
│   ├── core_container_sub/              # 渲染子组件
│   │   ├── MachineContainer.js          # 机器容器（基于 mask 逐格绘制）
│   │   └── BeltContainer.js             # 传送带容器
│   │
│   ├── core_sub/                        # 业务逻辑层 — 元素操作
│   │   ├── Machine.js                   # 机器：创建/放置/删除/旋转
│   │   ├── Belt.js                      # 传送带：创建/放置/旋转/删除/批量铺设
│   │   └── Pipe.js                      # 管道逻辑（待实现）
│   │
│   ├── core_middleware/                 # 中间层 — 数据持久化与校验
│   │   ├── MachineStorage.js            # 机器数据存储（基于 mask 的格子级存储）
│   │   ├── BeltStorage.js               # 传送带存储 + BFS 连通域查找
│   │   ├── PositionConvert.js           # 网格坐标 ↔ 像素坐标转换
│   │   ├── ConflictDetect.js            # 碰撞检测（待实现）
│   │   └── UndoProxy.js                 # 撤销代理（待实现）
│   │
│   ├── stores/                          # Pinia 状态仓库
│   │   ├── StorageStore.js              # 场景配置 + 所有元素的位置映射
│   │   ├── MachineStore.js              # 机器类型定义（mask、锚点、端口配置）
│   │   └── BeltStore.js                 # 传送带常量定义（类型、方向、旋转映射）
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
中间层 (core_middleware/)       — 数据持久化、连通域查找、碰撞检测
    ↕ 读写
渲染层 (core_stage/)            — Pixi.js 渲染、容器管理
    ↕ 使用
状态层 (stores/)                — Pinia 响应式数据仓库
```

### 场景层级结构（z-index 从低到高）

```
rootStage
  └── viewportContainer（可缩放根容器）
        ├── backgroundContainer    — 网格背景
        ├── beltRootContainer      — 传送带
        ├── pipeContainer          — 管道
        ├── machineRootContainer   — 机器
        └── indicatorContainer     — 指示器
```

### 机器系统

- 每台机器使用 **`mask` 二维矩阵** 描述内部布局，每个格子的值标识该位置的组件类型（`ma`=机身, `bi`=传送带入, `bo`=传送带出, `pi`=管入, `po`=管出）
- 旋转采用 **数据驱动** 方案：旋转 mask 矩阵、交换 `gridWidth/gridHeight`、切换对应锚点，然后重新创建容器，避免在渲染层做旋转变换
- 锚点定义为数组 `[anchor_0°, anchor_90°]`，支持长方形机器的两种旋转姿态

### 传送带系统

- 支持逐条创建与 **批量铺设**（自动计算路径、中间转折点）
- 存储格式为 `"${beltId}.${inDirection}.${outDirection}"`，记录方向信息
- 支持 **连通域查找**（BFS）：从任意传送带出发，沿 `out → in` 方向遍历整条链路，用于批量删除

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
| 碰撞检测 | ⏳ 待实现 |
| 管道系统 | ⏳ 待实现 |
| 撤销/重做 | ⏳ 待实现 |
| 用户交互（点击放置/拖拽） | ⏳ 待实现 |
| 指示器/高亮 | ⏳ 待实现 |
