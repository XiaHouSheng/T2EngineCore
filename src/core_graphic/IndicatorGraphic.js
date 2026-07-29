import { Container, Graphics, Sprite } from "pixi.js";
import { getCellSize } from "../core_middleware/PositionConvert";
import { useResourcesStore } from "../stores/ResourcesStore";

class IndicatorGraphic extends Container {
  constructor(
    position,
    size = { gridWidth: 1, gridHeight: 1 },
    pivot = { x: 0.5, y: 0.5 },
    is_conflict = false,
    machine_entity = null,
    pipe_or_belt_entity = null,
  ) {
    super();
    const cellSize = getCellSize();
    const { gridX, gridY } = position;
    const { gridWidth, gridHeight } = size;
    this.resourcesStore = useResourcesStore();
    this.cellHeight = cellSize.height;
    this.cellWidth = cellSize.width;
    this.gridX = gridX;
    this.gridY = gridY;
    this.pivot.x = pivot.x * this.cellWidth * gridWidth;
    this.pivot.y = pivot.y * this.cellHeight * gridHeight;
    this.x = gridX * this.cellWidth - this.cellWidth * 0.5;
    this.y = gridY * this.cellHeight - this.cellHeight * 0.5;

    // Graphics 作为子对象绘制矩形背景
    const bg = new Graphics();
    bg.rect(0, 0, gridWidth * this.cellWidth, gridHeight * this.cellHeight);
    if (!is_conflict) bg.fill({ color: 0x0000ff, alpha: 0.5 });
    else bg.fill({ color: 0xff0000, alpha: 0.5 });
    this.addChild(bg);

    this.#drawBeltPipePortIndicator(pipe_or_belt_entity);
    this.#drawMachinePortIndicator(machine_entity, cellSize);
  }

  moveToGrid(position) {
    const { gridX, gridY } = position;
    this.x = gridX * this.cellWidth - this.cellWidth * 0.5;
    this.y = gridY * this.cellHeight - this.cellHeight * 0.5;
  }

  #drawBeltPipePortIndicator(entity) {
    if (!entity) return;
    if (entity.type == "default") return;
    if (entity.in == "cross") return;
    const mapOutOffset = {
      up: { x: 0, y: -0.7 },
      down: { x: 0, y: 0.7 },
      left: { x: -0.7, y: 0 },
      right: { x: 0.7, y: 0 },
    };
    const in_dirs = entity.in.split("|");
    const out_dirs = entity.out.split("|");
    in_dirs.forEach((dir) => {
      const arrow = new Sprite({
        texture: this.resourcesStore.textures[`arrow_${dir}`],
        anchor: 0.5,
        position: {
          x: -mapOutOffset[dir].x * this.cellWidth + this.cellWidth * 0.5,
          y: -mapOutOffset[dir].y * this.cellHeight + this.cellHeight * 0.5,
        },
      });
      arrow.alpha = 0.8;
      arrow.tint = "yellow";
      arrow.setSize(this.cellWidth * 0.3, this.cellHeight * 0.3);
      this.addChild(arrow);
    });
    out_dirs.forEach((dir) => {
      const arrow = new Sprite({
        texture: this.resourcesStore.textures[`arrow_${dir}`],
        anchor: 0.5,
        position: {
          x: mapOutOffset[dir].x * this.cellWidth + this.cellWidth * 0.5,
          y: mapOutOffset[dir].y * this.cellHeight + this.cellHeight * 0.5,
        },
      });
      arrow.alpha = 0.8;
      arrow.tint = "black";
      arrow.setSize(this.cellWidth * 0.3, this.cellHeight * 0.3);
      this.addChild(arrow);
    });
  }

  #drawMachinePortIndicator(entity) {
    if (!entity) return;
    const mapOutOffset = {
      up: { x: 0, y: -0.7 },
      down: { x: 0, y: 0.7 },
      left: { x: -0.7, y: 0 },
      right: { x: 0.7, y: 0 },
    };
    const resourcesStore = useResourcesStore();
    entity.mask.forEach((col, y) => {
      col.forEach((mask_, x) => {
        const [type, dir] = mask_.split(".");
        if (dir) {
          const offset = {
            x:
              type.split("")[1] == "o"
                ? mapOutOffset[dir].x * this.cellWidth
                : -mapOutOffset[dir].x * this.cellWidth,
            y:
              type.split("")[1] == "o"
                ? mapOutOffset[dir].y * this.cellHeight
                : -mapOutOffset[dir].y * this.cellHeight,
          };
          const arrow = new Sprite({
            texture: resourcesStore.textures[`arrow_${dir}`],
            anchor: 0.5,
            position: {
              x: x * this.cellWidth + this.cellWidth * 0.5 + offset.x,
              y: y * this.cellHeight + this.cellHeight * 0.5 + offset.y,
            },
          });
          arrow.alpha = 0.8;
          arrow.tint = type == "bi" ? "yellow" : "black";
          arrow.setSize(this.cellWidth * 0.3, this.cellHeight * 0.3);
          this.addChild(arrow);
        }
      });
    });
  }
}

export { IndicatorGraphic };
