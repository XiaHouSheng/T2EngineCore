//像素坐标与网格坐标的转换
import { useStorageStore } from "../stores/StorageStore.js";

function gridToPixel(x, y) {
  const stageStore = useStorageStore();
  return {
    x: x * stageStore.cellWidth - stageStore.cellWidth / 2,
    y: y * stageStore.cellHeight - stageStore.cellHeight / 2,
  };
}

function pixelToGrid(x, y) {
  const stageStore = useStorageStore();
  return {
    gridX:
      Math.floor((x + stageStore.cellWidth / 2) / stageStore.cellWidth) + 1,
    gridY:
      Math.floor((y + stageStore.cellHeight / 2) / stageStore.cellHeight) + 1,
  };
}

function pixelToGridNoneOffset(x, y) {
  const stageStore = useStorageStore();
  return {
    gridX: Math.floor(x / stageStore.cellWidth) + 1,
    gridY: Math.floor(y / stageStore.cellHeight) + 1,
  };
}

function sizeGridToPixel(width, height) {
  const stageStore = useStorageStore();
  return {
    width: width * stageStore.cellWidth,
    height: height * stageStore.cellHeight,
  };
}

function getCellSize() {
  const stageStore = useStorageStore();
  return {
    width: stageStore.cellWidth,
    height: stageStore.cellHeight,
  };
}


export {
  gridToPixel,
  pixelToGrid,
  pixelToGridNoneOffset,
  sizeGridToPixel,
  getCellSize,
};
