import { Graphics } from "pixi.js";
class SelectGraphic extends Graphics {
  constructor() {
    super();
  }

  drawSelectBox(
    width,
    height,
    baseX,
    baseY,
    fillColor = 0x0000ff,
    alpha = 0.3,
  ) {
    this.clear();
    const startX = Math.min(baseX, baseX + width);
    const startY = Math.min(baseY, baseY + height);
    this.position.set(startX, startY);
    this.rect(0, 0, Math.abs(width), Math.abs(height)).fill({
      color: fillColor,
      alpha: alpha,
    });
  }
}

export { SelectGraphic };
