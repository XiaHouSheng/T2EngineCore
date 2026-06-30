import { Sprite, Container, Assets } from "pixi.js";
import {
  getCellSize,
  gridToPixel,
} from "../core_middleware/PositionConvert.js";

const texture = await Assets.load("https://ccswitch.io/favicon.png");

class PipeContainer extends Container {
  constructor(pipe) {
    super();
    this.pipe = pipe;
    const cellSize = getCellSize();
    const { x, y } = gridToPixel(pipe.gridX, pipe.gridY);

    this.cellWidth = cellSize.width;
    this.cellHeight = cellSize.height;

    const testSprite = new Sprite({
      texture: texture,
      width: this.cellWidth,
      height: this.cellHeight,
    });
    this.addChild(testSprite);

    const bounds = testSprite.getBounds();
    this.pivot.set(0.5 * bounds.width, 0.5 * bounds.height);
    this.position.set(x, y);
  }
}

export { PipeContainer };
