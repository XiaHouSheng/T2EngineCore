import { Application, Container, Graphics, NineSliceSprite, Texture } from 'pixi.js';

const app = new Application();
const rootStage = app.stage;
// 视图容器|用于缩放渲染
const viewportContainer = new Container();
// 指示器容器
const indicatorContainer = new Container();
// 机器容器
const machineRootContainer = new Container();
// 传送带容器
const beltRootContainer = new Container();
// 管道容器
const pipeContainer = new Container();
// 背景容器
const backgroundContainer = new Container();

// 结构布局
viewportContainer.addChild(
    backgroundContainer,
    beltRootContainer,
    pipeContainer,
    machineRootContainer,
    indicatorContainer,
)

// 根舞台添加视图容器
rootStage.addChild(viewportContainer);

export {
    app,
    rootStage,
    viewportContainer,
    indicatorContainer,
    machineRootContainer,
    pipeContainer,
    beltRootContainer,
    backgroundContainer,
}