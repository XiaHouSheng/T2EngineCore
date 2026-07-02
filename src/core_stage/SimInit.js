import { Graphics } from "pixi.js";
import { onMouseMove, onMouseDown, onMouseUp } from "../core_sub/Indicator.js";
import { backgroundContainer, indicatorContainer } from "./SimStage.js";
import { useStorageStore } from "../stores/StorageStore.js";
import {
  pixelToGrid,
  pixelToGridNoneOffset,
} from "../core_middleware/PositionConvert.js";

function drawGridLines() {
  const grid = new Graphics();
  const stageStore = useStorageStore();

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

function drawHitArea() {
  const stageStore = useStorageStore();
  const width = stageStore.width;
  const height = stageStore.height;
  const hitArea = new Graphics({
    eventMode: "static",
  })
    .rect(0, 0, width, height)
    .fill({ alpha: 0.0001 });
  indicatorContainer.addChild(hitArea);
  hitArea.on("pointerdown", (event) => {
    const grid_position = pixelToGridNoneOffset(event.x, event.y);
    const result = {
      ...event,
      ...grid_position,
    };
    onMouseDown(result);
  });
  hitArea.on("pointerup", (event) => {
    const grid_position = pixelToGridNoneOffset(event.x, event.y);
    const result = {
      ...event,
      ...grid_position,
    };
    onMouseUp(result);
  });
  hitArea.on("pointermove", (event) => {
    const grid_position = pixelToGridNoneOffset(event.x, event.y);
    const result = {
      ...event,
      ...grid_position,
    };
    onMouseMove(result);
  });
}

export { drawGridLines, drawHitArea };
