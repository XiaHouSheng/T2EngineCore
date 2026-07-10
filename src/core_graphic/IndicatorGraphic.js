import { Graphics } from "pixi.js";
import { getCellSize } from "../core_middleware/PositionConvert";

class IndicatorGraphic extends Graphics {
  constructor(
    position,
    size = { gridWidth: 1, gridHeight: 1 },
    pivot = { x: 0.5, y: 0.5 },
    is_conflict = false,
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
    this.rect(0, 0,
      gridWidth * this.cellWidth,
      gridHeight * this.cellHeight,
    );
    this.x = gridX * this.cellWidth - this.cellWidth * 0.5;
    this.y = gridY * this.cellHeight - this.cellHeight * 0.5;
    if (!is_conflict) this.fill({ color: 0x0000ff, alpha: 0.5 });
    else this.fill({ color: 0xff0000, alpha: 0.5 });
  }

  moveToGrid(position) {
    const { gridX, gridY } = position;
    this.x = gridX * this.cellWidth - this.cellWidth * 0.5;
    this.y = gridY * this.cellHeight - this.cellHeight * 0.5;
  }
}

export { IndicatorGraphic };
