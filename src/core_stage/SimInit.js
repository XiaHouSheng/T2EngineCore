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
  // roundPixels: 绘制时把坐标对齐到整数像素，避免 0.5px 偏移导致的线条发虚
  const grid = new Graphics({ roundPixels: true });
  if (!storageStore) storageStore = useStorageStore();
  const row = storageStore.rowCount;
  const col = storageStore.colCount;
  const width = storageStore.width;
  const height = storageStore.height;
  const gridWidth = width / col;
  const gridHeight = height / row;

  // 图纸风格：线段在交点附近断开，交点画小方块
  // 交点留白与方块尺寸均随格子尺寸缩放
  const gap = Math.min(gridWidth, gridHeight) * 0.18;
  const dotSize = Math.max(Math.min(gridWidth, gridHeight) * 0.04, 1);

  // 水平分段线：每个相邻交点之间绘制，交点两侧留白
  for (let i = 0; i <= row; i++) {
    const y = i * gridHeight;
    for (let j = 0; j < col; j++) {
      const x0 = j * gridWidth + gap;
      const x1 = (j + 1) * gridWidth - gap;
      if (x1 > x0) {
        grid.moveTo(x0, y);
        grid.lineTo(x1, y);
      }
    }
  }

  // 垂直分段线
  for (let j = 0; j <= col; j++) {
    const x = j * gridWidth;
    for (let i = 0; i < row; i++) {
      const y0 = i * gridHeight + gap;
      const y1 = (i + 1) * gridHeight - gap;
      if (y1 > y0) {
        grid.moveTo(x, y0);
        grid.lineTo(x, y1);
      }
    }
  }

  grid.stroke({
    pixelLine: true,
    color: 0x123123,
  });

  // 交点小方块
  for (let i = 0; i <= row; i++) {
    for (let j = 0; j <= col; j++) {
      grid.rect(
        j * gridWidth - dotSize / 2,
        i * gridHeight - dotSize / 2,
        dotSize,
        dotSize,
      );
    }
  }
  grid.fill({ color: 0x123123 });

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
