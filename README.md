# SimulationEngine

基于 **Vue 3 + Pixi.js 8** 的工厂物流仿真引擎，提供网格化的工厂布局编辑与可视化能力。

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
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 项目结构

```
SimulationEngine/
├── src/
│   ├── components/
│   │   └── Index.vue                         # 主视图组件（初始化 PixiJS 场景）
│   │
│   ├── core_stage/                           # 渲染层 — PixiJS 绘制
│   │   ├── SimStage.js                       # Pixi Application + 各层级容器
│   │   ├── SimInit.js                        # 场景初始化（网格线、交互层）
│   │   ├── MachineStage.js                   # 机器：绘制/移除
│   │   ├── BeltStage.js                      # 传送带：绘制/移除
│   │   ├── PipeStage.js                      # 管道：绘制/移除
│   │   └── IndicatorStage.js                 # 指示器：高亮/路径预览/框选遮罩
│   │
│   ├── core_sub/                             # 业务逻辑层 — 实体操作
│   │   ├── Machine.js                        # 机器 CRUD + 旋转
│   │   ├── Belt.js                           # 传送带 CRUD + 批量铺设 + 旋转
│   │   ├── Pipe.js                           # 管道 CRUD + 批量铺设 + 旋转
│   │   └── Indicator.js                      # 交互控制器（事件路由 + 命令状态 + 选择/移动）
│   │
│   ├── core_storage/                         # 数据持久层 — Pinia Store 读写
│   │   ├── MachineStorage.js                 # 机器存储（mask 格子级映射）
│   │   ├── BeltStorage.js                    # 传送带存储 + BFS 连通域查找
│   │   └── PipeStorage.js                    # 管道存储 + BFS 连通域查找
│   │
│   ├── core_middleware/                      # 中间层
│   │   ├── PositionConvert.js                # 网格坐标 ↔ 像素坐标转换
│   │   ├── GridRegistry.js                   # 统一空间查询（像素级实体检索）
│   │   ├── KeyboardHandle.js                 # 键盘事件 → 命令路由
│   │   ├── ConflictDetect.js                 # 碰撞检测
│   │   └── UndoProxy.js                      # 撤销代理
│   │
│   ├── core_container_sub/                   # PixiJS 容器封装
│   │   ├── MachineContainer.js               # 机器容器（基于 mask 逐格绘制）
│   │   ├── BeltContainer.js                  # 传送带容器
│   │   └── PipeContainer.js                  # 管道容器
│   │
│   ├── core_graphic/                         # 可复用 PixiJS 图形类
│   │   ├── IndicatorGraphic.js               # 高亮指示器（支持 moveToGrid 重定位）
│   │   └── SelectGraphic.js                  # 框选框图形
│   │
│   ├── stores/                               # Pinia 状态库
│   │   ├── StorageStore.js                   # 场景配置 + 所有元素的位置映射
│   │   ├── MachineStore.js                   # 机器类型定义（mask、锚点）
│   │   ├── BeltStore.js                      # 传送带常量定义（方向、旋转映射）
│   │   ├── PipeStore.js                      # 管道常量定义（方向、旋转映射）
│   │   └── KeyBoardStore.js                  # 键盘命令映射 + 处理函数注册
│   │
│   ├── assets/resources/                     # 静态资源
│   ├── App.vue                               # 根组件
│   ├── main.js                               # 入口
│   └── style.css                             # 全局样式
│
├── index.html
├── package.json
└── vite.config.js
```

## 架构设计

### 分层架构

```
交互层 (components/Index.vue)
    │
    ▼
控制器层 (core_sub/Indicator.js)
    │ 鼠标事件路由 + 命令状态管理
    │
    ├──▶ 业务逻辑 (core_sub/Machine.js / Belt.js / Pipe.js)
    │       ├──▶ 存储 (core_storage/*)           ── 读写 Pinia Store
    │       ├──▶ 渲染 (core_stage/*)             ── 绘制/移除容器
    │       └──▶ 冲突检测 (core_middleware/ConflictDetect)
    │
    └──▶ 中间件 (core_middleware/*)
            ├── PositionConvert   — 坐标转换
            ├── GridRegistry      — 空间查询
            └── KeyboardHandle    — 键盘分发
```

### 场景层级（z-index 从低到高）

```
rootStage
  └── viewportContainer（可缩放）
        ├── backgroundContainer     — 网格背景
        ├── beltRootContainer       — 传送带
        ├── pipeRootContainer       — 管道
        ├── machineRootContainer    — 机器
        └── indicatorContainer      — 指示器（高亮/框选）
```

### 事件调度机制

```
用户输入（鼠标/键盘）
    │
    ▼
SimInit.js (hitArea 捕获 PIXI 事件)
    │ 转换为 { client.x/y, gridX/Y } 事件对象
    ▼
Indicator.js (onMouseDown/Move/Up)
    │ 回调队列 dispatch
    ▼
queue.mousedown[name] / queue.mousemove[name] / queue.mouseup[name]
    │
    ▼
各命令注册的回调（placeBelt / select / move ...）
```

每次进入新命令时通过 `onCancel()` 清空队列，确保同一时间只有一种命令模式激活。

### 实体系统

所有三种实体（Machine / Belt / Pipe）遵循相同的模块模式：

```
core_sub/Entity.js        — CRUD 业务逻辑
core_stage/EntityStage.js — 渲染（draw / dropDraw）
core_storage/EntityStorage.js — 数据持久化（save / drop / query）
```

#### 机器

- 使用 **`mask` 二维矩阵** 描述内部布局，每个格子标识组件类型（`ma`=机身, `bi`=带入口, `bo`=带出口, `pi`=管入口, `po`=管出口）
- 旋转采用**数据驱动**方案：旋转 mask 矩阵 → 交换 `gridWidth/gridHeight` → 切换锚点 → 重建容器，避免在渲染层做变换
- 锚点定义为 `[anchor_0°, anchor_90°]` 数组，支持长方形机器的两种姿态

#### 传送带 / 管道

- Belt 与 Pipe 结构完全对称，共享同一套设计模式
- 支持逐条创建与**批量铺设**（自动计算 L 形路径）
- 存储格式 `"${id}.${inDir}.${outDir}"`，记录连接方向
- 支持 **BFS 连通域查找**：沿 `out → in` 遍历整条链路，用于批量删除

### 选择系统

```
SELECT 命令激活
    │
    ▼
框选（drawSelectBox）
    │ onmouseup
    ▼
scanGridByPixel (GridRegistry) → { machines, belts, pipes }
    │
    ▼
drawMaskSelectArea — 在 indicatorContainer 上绘制高亮遮罩
    │ 可多次框选累加（Set 去重）
    ▼
selectGraphics = { machines: {...}, belts: {...}, pipes: {...} }
    │
    ├── MOVE   → delete 原始 → masks 跟随鼠标 → mousedown 确认放置
    ├── ROTATE → (待实现)
    └── DELETE → (待实现)
```

### 键盘命令系统

分层映射：`KeyBoardStore`（定义）→ `KeyboardHandle`（路由）→ `Indicator`（执行）

- **基命令**：`SELECT`（x）、`PLACE_BELT`（e）、`PLACE_PIPE`（q）、`CANCEL`（Escape）
- **子命令**：`MOVE`（m）、`ROTATE`（r）、`DELETE`（f）
- 复合命令：基命令 + 子命令 = 组合操作（如 `SELECT + MOVE → SELECT_MOVE`）
- 子命令可重复触发，基命令去重，ESC 取消

## 配置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| 场景宽高 | `600 × 600` | 像素 |
| 网格数 | `10 × 10` | |
| 背景色 | `0xffffff` | 白色 |

所有配置集中在 `StorageStore`，修改后 `cellWidth` / `cellHeight` 自动计算。

## 开发状态

| 模块 | 状态 |
|------|------|
| 网格渲染 | ✅ 已完成 |
| 机器创建/放置/删除 | ✅ 已完成 |
| 机器旋转（数据驱动） | ✅ 已完成 |
| 传送带单条/批量创建 | ✅ 已完成 |
| 传送带 BFS 连通域 | ✅ 已完成 |
| 传送带旋转 | ✅ 已完成 |
| 管道系统（对称实现） | ✅ 已完成 |
| 指示器/高亮系统 | ✅ 已完成 |
| 键盘命令路由 | ✅ 已完成 |
| 框选 + 选中高亮 | ✅ 已完成 |
| 选中后移动 | ✅ 已完成 |
| 选中后旋转/删除 | ⏳ 待实现 |
| 碰撞检测 | ⏳ 待实现 |
| 撤销/重做 | ⏳ 待实现 |
