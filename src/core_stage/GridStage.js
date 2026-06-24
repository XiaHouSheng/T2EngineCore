import { Graphics } from "pixi.js";
import { backgroundContainer } from "./SimStage.js";
import { useStageStore } from "../stores/StageConfig.js";

function drawGridLines() {
  const grid = new Graphics();
  const stageStore = useStageStore();

  const row = stageStore.rowCount;
  const col = stageStore.colCount;
  const width = stageStore.width;
  const height = stageStore.height;
  const gridWidth = width / col;
  const gridHeight = height / row;

  for (let i = 0; i < row; i++) {
    grid.moveTo(0, i * gridHeight);
    grid.lineTo(width, i * gridHeight);
  }

  for (let i = 0; i < col; i++) {
    grid.moveTo(i * gridWidth, 0);
    grid.lineTo(i * gridWidth, height);
  }

  grid.stroke({
    pixelLine: true,
    color: 0x123123,
  });

  backgroundContainer.addChild(grid);
}

export { drawGridLines };
