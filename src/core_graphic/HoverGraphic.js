import { Graphics } from "pixi.js";
import { getCellSize } from "../core_middleware/PositionConvert";

class HoverGraphic extends Graphics {
  constructor(
    position,
    size = { gridWidth: 1, gridHeight: 1 },
    pivot = { x: 0.5, y: 0.5 },
  ) {
    super();
    const cellSize = getCellSize();
    const { gridX, gridY } = position;
    const { gridWidth, gridHeight } = size;
    this.cellHeight = cellSize.height;
    this.cellWidth = cellSize.width;
    this.gridX = gridX;
    this.gridY = gridY;
    this.pivot.x = pivot.x * this.cellWidth * gridWidth;
    this.pivot.y = pivot.y * this.cellHeight * gridHeight;

    // 撑开容器宽高
    this.rect(0, 0,
      gridWidth * this.cellWidth,
      gridHeight * this.cellHeight,
    ).fill({ alpha: 0.0001 });

    // 四个角的黄色框
    const totalW = gridWidth * this.cellWidth;
    const totalH = gridHeight * this.cellHeight;
    const len = Math.min(this.cellWidth, this.cellHeight) * 0.4;
    // 左上
    this.moveTo(0, len).lineTo(0, 0).lineTo(len, 0);
    // 右上
    this.moveTo(totalW - len, 0).lineTo(totalW, 0).lineTo(totalW, len);
    // 左下
    this.moveTo(0, totalH - len).lineTo(0, totalH).lineTo(len, totalH);
    // 右下
    this.moveTo(totalW - len, totalH).lineTo(totalW, totalH).lineTo(totalW, totalH - len);
    this.stroke({ color: 0xffff00, width: 2 });


    this.x = gridX * this.cellWidth - this.cellWidth * 0.5;
    this.y = gridY * this.cellHeight - this.cellHeight * 0.5;
  }

}

export { HoverGraphic };
