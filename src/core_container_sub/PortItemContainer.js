import { MachineContainer } from "../core_container_sub/MachineContainer";
import { parseMaskCell } from "../core_middleware/MaskUtil";

export class PortItemContainer extends MachineContainer {
  constructor(machine) {
    super(machine);
  }

  renderBody() {
    this.renderPorts(this.machine);
    this.renderBackground();
    this.renderUI();
  }

  renderRecipeUI() {
    const mask = this.machine.mask || this.machine.defaultMask;
    for (let row = 0; row < mask.length; row++) {
      for (let col = 0; col < mask[row].length; col++) {
        const cell = mask[row][col];
        if (cell === "ma") continue;
        const parsed = parseMaskCell(cell);
        if (!parsed) continue;
        const { type, dir, portId } = parsed;
        if (!portId) continue;
        const itemId = this.machine.port_recipe_icon[portId];
        if (!itemId) continue;
        const iconSize = Math.min(this.cellWidth, this.cellHeight) * 0.8;
        const item_icon = this.createItemIcon(itemId, iconSize);
        item_icon.x = this.cellWidth * col + this.cellWidth / 2;
        item_icon.y = this.cellHeight * row + this.cellHeight / 2;
        this.recipeContainer.addChild(item_icon);
      }
    }
  }
}
