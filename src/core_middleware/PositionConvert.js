//像素坐标与网格坐标的转换
import { useStageStore } from "../stores/StageConfig.js";

function gridToPixel(x, y) {
  const stageStore = useStageStore();
  return {
    x: x * stageStore.cellWidth,
    y: y * stageStore.cellHeight,
  };
}

export { gridToPixel };