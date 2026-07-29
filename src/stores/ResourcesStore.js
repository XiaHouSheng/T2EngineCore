import { defineStore } from "pinia";

//全局资源管理：图标索引、物品数据、配方、机器定义、精灵图纹理
export const useResourcesStore = defineStore("resourcesStore", () => {
  // black_list_machine 设置机器黑名单
  const black_list_machine = ["gas_pump_1"];

  // icons：data.json 中的 icons 数组，按 id 索引
  const icons = {};

  // categories：data.json 中的 categories 数组，按 id 索引
  const categories = {};

  // items：data.json 中的 items 数组，按 id 索引
  const items = {};

  // recipes：data.json 中的 recipes 数组，按 id 索引
  const recipes = {};

  // machines：从 data.json items 中提取的机器定义，按 item.id 索引
  // 每个机器包含 id / gridWidth / gridHeight / anchor / mask
  // cube 机器（gridWidth === gridHeight）anchor 自动居中
  const machines = {};

  // textures：public/textures/ 下所有 PNG，key = 文件名(不含扩展名)
  const textures = {};

  // beltSprites / pipeSprites：根据传送带/管道贴图构建的方向索引 sprite 表
  // key = "入口方向.出口方向"，如 "right.right"（直）、"down.right"（弯）
  const beltSprites = {};
  const pipeSprites = {};

  // beltPorts / pipePorts：端口贴图表
  // belt key = 方向，如 "down"、"left"；pipe key = "类型.方向"，如 "in.down"、"out.up"
  const beltPorts = {};
  const pipePorts = {};

  // iconsheetTexture：icons.webp 的 PIXI Texture 引用
  let iconsheetTexture = null;

  /* ---------- 注入方法 ---------- */

  function setIcons(arr) {
    Object.keys(icons).forEach((k) => delete icons[k]);
    for (const icon of arr) {
      icons[icon.id] = icon;
    }
  }

  function setCategories(arr) {
    Object.keys(categories).forEach((k) => delete categories[k]);
    for (const cat of arr) {
      categories[cat.id] = cat;
    }
  }

  function setItems(arr) {
    Object.keys(items).forEach((k) => delete items[k]);
    for (const item of arr) {
      items[item.id] = item;
    }
  }

  function setRecipes(arr) {
    Object.keys(recipes).forEach((k) => delete recipes[k]);
    for (const recipe of arr) {
      recipes[recipe.id] = recipe;
    }
  }

  /**
   * 从 data.json items 中提取机器定义
   * 只处理带有 machine.size 的条目（category === "machine"）
   * 每个机器被注入 id 字段；cube（gridWidth === gridHeight）anchor 自动居中
   * @param {object[]} itemsArr - data.json 的 items 数组
   */
  function setMachinesFromItems(itemsArr) {
    Object.keys(machines).forEach((k) => delete machines[k]);
    for (const item of itemsArr) {
      if (!item.machine || !item.machine.size) continue;
      const [w, h] = item.machine.size;
      machines[item.id] = {
        id: item.id,
        name: item.name,
        gridWidth: w,
        gridHeight: h,
        anchor: [
          { x: 0.5, y: 0.5 },
          { x: 0.5, y: 0.5 },
        ],
        mask: null,
      };
    }
  }

  /**
   * 为每个 machine 注入 recipe_id（该机器可生产的配方 id 列表）
   * 遍历 recipes，若 recipe.producers 包含 machine.id，则将该 recipe.id 加入
   */
  function injectMachineRecipeIds() {
    for (const machine of Object.values(machines)) {
      const ids = [];
      for (const recipe of Object.values(recipes)) {
        if (recipe.producers && recipe.producers.includes(machine.id)) {
          ids.push(recipe.id);
        }
      }
      if (ids.length > 0) {
        machine.recipe_id = ids;
      }
    }
  }

  function setIconTexture(texture) {
    iconsheetTexture = texture;
  }

  /**
   * 批量设置纹理，key = 文件名(不含扩展名)，value = PIXI.Texture
   * @param {Record<string, Texture>} map
   */
  function setTextures(map) {
    Object.keys(textures).forEach((k) => delete textures[k]);
    Object.assign(textures, map);
  }

  /**
   * 批量设置 belt/pipe sprite 表
   * @param {{ belt: Record<string, Sprite>, pipe: Record<string, Sprite> }} sheets
   */
  function setSpriteSheets({ belt, pipe }) {
    Object.keys(beltSprites).forEach((k) => delete beltSprites[k]);
    Object.assign(beltSprites, belt);
    Object.keys(pipeSprites).forEach((k) => delete pipeSprites[k]);
    Object.assign(pipeSprites, pipe);
  }

  /**
   * 从 machines_1_4.json 配置向 machines 注入 anchor 和 mask
   * 跳过黑名单中的机器
   * @param {Record<string, {id, anchor?, mask?}>} configMap
   */
  function injectMachineAnchorMask(configMap) {
    for (const [key, cfg] of Object.entries(configMap)) {
      if (black_list_machine.includes(key)) continue;
      if (machines[cfg.id]) {
        if (cfg.anchor) machines[cfg.id].anchor = cfg.anchor;
        if (cfg.mask) machines[cfg.id].mask = cfg.mask;
      }
    }
  }

  /**
   * 批量设置 belt/pipe 端口贴图表
   * @param {{ belt: Record<string, {texture, rotation}>, pipe: Record<string, {texture, rotation}> }} ports
   */
  function setPortSheets({ belt, pipe }) {
    Object.keys(beltPorts).forEach((k) => delete beltPorts[k]);
    Object.assign(beltPorts, belt);
    Object.keys(pipePorts).forEach((k) => delete pipePorts[k]);
    Object.assign(pipePorts, pipe);
  }

  return {
    icons,
    categories,
    items,
    recipes,
    machines,
    textures,
    beltSprites,
    pipeSprites,
    beltPorts,
    pipePorts,
    iconsheetTexture,
    setIcons,
    setCategories,
    setItems,
    setRecipes,
    setMachinesFromItems,
    injectMachineRecipeIds,
    setIconTexture,
    setTextures,
    setSpriteSheets,
    injectMachineAnchorMask,
    setPortSheets,
    black_list_machine,
  };
});
