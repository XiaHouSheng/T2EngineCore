import { Sprite, Container, Rectangle, Assets } from "pixi.js";
import {
  getCellSize,
  gridToPixel,
} from "../core_middleware/PositionConvert.js";

const texture = await Assets.load("https://ccswitch.io/favicon.png");

class MachineContainer extends Container {
  constructor(machine) {
    super();
    this.machine = machine;
    const cellSize = getCellSize();
    const { x, y } = gridToPixel(machine.gridX, machine.gridY);

    this.cellWidth = cellSize.width;
    this.cellHeight = cellSize.height;
    this.portContainer = new Container();
    this.uiContainer = new Container();

    this.addChild(this.portContainer);
    this.addChild(this.uiContainer);

    for (let x = 0; x < machine.gridWidth; x++) {
      for (let y = 0; y < machine.gridHeight; y++) {
        const testSprite = new Sprite({
          texture,
          width: this.cellWidth,
          height: this.cellHeight,
          x: x * this.cellWidth,
          y: y * this.cellHeight,
        });
        this.portContainer.addChild(testSprite);
      }
    }

    const bounds = this.portContainer.getBounds();
    this.pivot.set(
      machine.anchor[machine.rotation].x * bounds.width,
      machine.anchor[machine.rotation].y * bounds.height,
    );
    this.position.set(x, y);

  }

}

export { MachineContainer };
