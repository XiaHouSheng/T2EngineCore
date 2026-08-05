import { MachineContainer } from "../core_container_sub/MachineContainer";
import { parseMaskCell } from "../core_middleware/MaskUtil";

export class PortRecipeContainer extends MachineContainer {
  constructor(machine) {
    super(machine);
  }

  renderBody() {
    this.renderPorts();
    this.renderBackground();
    this.renderUI(true, true);
    this.renderRecipePort();
  }

  renderRecipePort(force = false) {
    const machine = this.machine;

    // 1. 解析当前配方（now_recipe 优先，缺省用第一个可生产配方）
    const recipeIds = machine.recipe_id;
    if (!recipeIds || recipeIds.length === 0) return;
    const recipe =
      this.resourcesStore.recipes[machine.now_recipe || recipeIds[0]];
    if (!recipe) return;

    // 2. 只取液体/气体输出（gas_ / liquid_ 前缀），最多两个
    const fluidOuts = Object.keys(recipe.out || {}).filter(
      (id) => id.startsWith("gas_") || id.startsWith("liquid_"),
    );
    if (fluidOuts.length === 0) return;

    // 3. 先写 port_recipe_icon：单输出 → po1/po2 相同 icon；双输出 → 依次分配
    //    已存在的配置不覆盖（保留手动指定的端口图标）
    if (!machine.port_recipe_icon) machine.port_recipe_icon = {};
    if (fluidOuts.length === 1) {
      if (!machine.port_recipe_icon["po1"] || force)
        machine.port_recipe_icon["po1"] = fluidOuts[0];
      if (!machine.port_recipe_icon["po2"] || force)
        machine.port_recipe_icon["po2"] = fluidOuts[0];
    } else {
      if (!machine.port_recipe_icon["po1"] || force)
        machine.port_recipe_icon["po1"] = fluidOuts[0];
      if (!machine.port_recipe_icon["po2"] || force)
        machine.port_recipe_icon["po2"] = fluidOuts[1];
    }

    // 4. 渲染：遍历 mask，带端口 id 且有图标的格子画出 item icon
    const mask = machine.mask || machine.defaultMask;
    for (let row = 0; row < mask.length; row++) {
      for (let col = 0; col < mask[row].length; col++) {
        const cell = mask[row][col];
        if (cell === "ma") continue;
        const parsed = parseMaskCell(cell);
        if (!parsed) continue;
        const { portId } = parsed;
        if (!portId) continue;
        const itemId = machine.port_recipe_icon[portId];
        if (!itemId) continue;
        const iconSize = Math.min(this.cellWidth, this.cellHeight) * 0.8;
        const item_icon = this.createItemIcon(itemId, iconSize);
        item_icon.x = this.cellWidth * col + this.cellWidth / 2;
        item_icon.y = this.cellHeight * row + this.cellHeight / 2;
        this.recipeContainer.addChild(item_icon);
      }
    }
  }

  refreshRecipeUI() {
    super.refreshRecipeUI();
    this.renderRecipePort(true);
  }
}
