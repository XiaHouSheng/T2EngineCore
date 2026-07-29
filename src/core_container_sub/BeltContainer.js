import { Sprite, Container, Assets } from "pixi.js";
import {
  getCellSize,
  gridToPixel,
} from "../core_middleware/PositionConvert.js";
import { useResourcesStore } from "../stores/ResourcesStore.js";

class BeltContainer extends Container {
  constructor(belt) {
    super();
    this.belt = belt;
    const resourcesStore = useResourcesStore();
    const cellSize = getCellSize();
    const { x, y } = gridToPixel(belt.gridX, belt.gridY);

    this.cellWidth = cellSize.width;
    this.cellHeight = cellSize.height;

    const entry = resourcesStore.beltSprites[`${belt.in}.${belt.out}`];
    console.log(entry)
    const defaultSprite = new Sprite({
      texture: entry.texture,
      anchor: 0.5,
      rotation: entry.rotation,
      width: this.cellWidth,
      height: this.cellHeight,
    });
    this.addChild(defaultSprite);
    
    /*
    const testSprite = new Sprite({
      texture: texture,
      anchor: 0.5,
      width: this.cellWidth,
      height: this.cellHeight,
    });
    this.addChild(testSprite);
    */

    this.position.set(x, y);
  }
}

export { BeltContainer };
