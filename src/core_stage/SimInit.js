import { Graphics } from "pixi.js";
import { onWheelChange } from "../core_sub/Scale.js";
import {
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onMouseOut,
  onMouseOver,
} from "../core_sub/Indicator.js";
import {
  backgroundContainer,
  indicatorContainer,
  viewportContainer,
} from "./SimStage.js";
import { useStorageStore } from "../stores/StorageStore.js";
import {
  pixelToGrid,
  pixelToGridNoneOffset,
} from "../core_middleware/PositionConvert.js";

let storageStore = null;

// 代理函数，用于event的坐标补偿
function proxyProcessPositionWithScale(event) {
  if (!storageStore) storageStore = useStorageStore();
  const { x: offsetX, y: offsetY } = storageStore.offset_position;
  const scale = storageStore.scale;
  // event.screen 为 canvas 内部坐标，Pixi 已用 getBoundingClientRect 补偿
  // canvas 在页面中的位置、CSS 缩放与 devicePixelRatio，无需再手动补偿
  const screenX = (event.screen.x - offsetX) / scale;
  const screenY = (event.screen.y - offsetY) / scale;
  const grid_position = pixelToGridNoneOffset(screenX, screenY);
  const result = {
    ...event,
    ...grid_position,
  };
  return result;
}

function drawGridLines() {
  const grid = new Graphics();
  if (!storageStore) storageStore = useStorageStore();
  const row = storageStore.rowCount;
  const col = storageStore.colCount;
  const width = storageStore.width;
  const height = storageStore.height;
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
  if (!storageStore) storageStore = useStorageStore();
  const width = storageStore.width;
  const height = storageStore.height;
  const hitArea = new Graphics({
    eventMode: "static",
  })
    .rect(0, 0, width, height)
    .fill({ alpha: 0.0001 });
  indicatorContainer.addChild(hitArea);
  hitArea.on("pointerdown", (event) => {
    const result = proxyProcessPositionWithScale(event);
    onMouseDown(result);
  });
  hitArea.on("pointerup", (event) => {
    const result = proxyProcessPositionWithScale(event);
    onMouseUp(result);
  });
  hitArea.on("pointermove", (event) => {
    const result = proxyProcessPositionWithScale(event);
    onMouseMove(result);
  });
  hitArea.on("pointerout", (event) => {
    const result = proxyProcessPositionWithScale(event);
    onMouseOut(result);
  });
  hitArea.on("pointerover", (event) => {
    const result = proxyProcessPositionWithScale(event);
    onMouseOver(result);
  });
  hitArea.on("wheel", (event) => {
    onWheelChange(event);
  });
}

export { drawGridLines, drawHitArea };
