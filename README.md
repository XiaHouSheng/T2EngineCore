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
│   │   └── Index.vue              # 主视图组件（初始化场景）
│   ├── core_stage/                # 渲染层 - 各元素在 Pixi.js 上的绘制
│   │   ├── SimStage.js            # Pixi Application 与各层级容器
│   │   ├── GridStage.js           # 网格线绘制
│   │   ├── MachineStage.js        # 机器 Sprite 绘制
│   │   ├── BeltStage.js           # 传送带绘制（待实现）
│   │   ├── PipeStage.js           # 管道绘制（待实现）
│   │   └── IndicatorStage.js      # 指示器绘制（待实现）
│   ├── core_sub/                  # 业务逻辑层 - 元素操作
│   │   ├── Machine.js             # 机器的创建/放置/删除/旋转
│   │   ├── Belt.js                # 传送带逻辑（待实现）
│   │   └── Pipe.js                # 管道逻辑（待实现）
│   ├── core_middleware/           # 中间层 - 数据持久化与校验
│   │   ├── MachineStorage.js      # 机器数据的增删改查（待实现）
│   │   ├── PositionConvert.js     # 网格坐标 ↔ 像素坐标转换
│   │   └── ConflictDetect.js      # 碰撞检测（待实现）
│   ├── stores/                    # Pinia 状态仓库
│   │   ├── StageConfig.js         # 场景配置（宽高、行列数、元素位置映射）
│   │   └── MachineStore.js        # 机器类型定义与尺寸计算
│   ├── App.vue                    # 根组件
│   ├── main.js                    # 入口文件
│   └── style.css                  # 全局样式
├── index.html
├── package.json
└── vite.config.js
```

## 核心设计

### 分层架构

```
业务逻辑层 (core_sub/)
    ↕ 调用
中间层 (core_middleware/) — 数据持久化 + 冲突检测
    ↕ 读写
渲染层 (core_stage/) — Pixi.js 渲染
    ↕ 调度
状态层 (stores/) — Pinia 数据仓库
```

### 场景层级结构

Pixi.js 的场景容器按 z-index 从低到高排列：

```
rootStage
  └── viewportContainer (可缩放根容器)
        ├── backgroundContainer  — 网格背景
        ├── conveyorContainer    — 传送带
        ├── pipeContainer        — 管道
        ├── machineContainer     — 机器
        └── indicatorContainer   — 指示器
```

### 网格系统

- 默认场景尺寸：`600 × 600` 像素
- 默认网格：`10 × 10` 格
- 每格尺寸由 `cellWidth = width / colCount`、`cellHeight = height / rowCount` 动态计算
- 坐标转换通过 `PositionConvert.js` 的 `gridToPixel()` 实现

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

## 状态

该项目处于早期开发阶段，核心框架已搭建，部分模块（传送带、管道、碰撞检测、数据持久化等）为待实现状态。
