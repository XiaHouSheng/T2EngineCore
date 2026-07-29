import { Sprite, Container } from "pixi.js";
import {
  getCellSize,
  gridToPixel,
} from "../core_middleware/PositionConvert.js";
import { useResourcesStore } from "../stores/ResourcesStore.js";

class PipeContainer extends Container {
  constructor(pipe) {
    super();
    this.pipe = pipe;
    const resourcesStore = useResourcesStore();
    const cellSize = getCellSize();
    const { x, y } = gridToPixel(pipe.gridX, pipe.gridY);

    this.cellWidth = cellSize.width;
    this.cellHeight = cellSize.height;
    
    console.log(`${pipe.in}.${pipe.out}`)
    console.log(resourcesStore.pipeSprites)
    const entry = resourcesStore.pipeSprites[`${pipe.in}.${pipe.out}`];
    const defaultSprite = new Sprite(entry.texture);
    defaultSprite.anchor.set(0.5, 0.5);
    defaultSprite.rotation = entry.rotation;
    defaultSprite.width = this.cellWidth;
    defaultSprite.height = this.cellHeight;
    this.addChild(defaultSprite);
    
    this.position.set(x, y);
  }
}

export { PipeContainer };
