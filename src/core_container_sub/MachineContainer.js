import { Sprite, Container, Graphics, Text, Texture, Rectangle } from "pixi.js";
import {
  getCellSize,
  gridToPixel,
} from "../core_middleware/PositionConvert.js";
import { useResourcesStore } from "../stores/ResourcesStore.js";
import { useStorageStore } from "../stores/StorageStore.js";

// 端口贴图边界偏移比例（贴图留白推至格子边缘）
// 值来自 StorageStore.default_belt_port_offset / default_pipe_port_offset

/**
 * 根据端口类型、方向和偏移因子计算偏移量
 * out 类型（bo/po）：沿方向推
 * in 类型（bi/pi）：沿反方向推
 * @param {"bi"|"bo"|"pi"|"po"} type
 * @param {"up"|"down"|"left"|"right"} dir
 * @param {number} cellW
 * @param {number} cellH
 * @param {number} factor - 偏移比例
 */
function getPortOffset(type, dir, cellW, cellH, factor) {
  const sign = (type === "bo" || type === "po" ? 1 : -1) * factor;
  switch (dir) {
    case "up":
      return { x: 0, y: -cellH * sign };
    case "down":
      return { x: 0, y: +cellH * sign };
    case "left":
      return { x: -cellW * sign, y: 0 };
    case "right":
      return { x: +cellW * sign, y: 0 };
  }
  return { x: 0, y: 0 };
}

/**
 * 从 spritesheet 裁剪一个物品图标，返回 Container（圆形背景 + Sprite）
 */
function createItemIcon(itemId, resourcesStore, size) {
  const iconData = resourcesStore.icons[itemId];
  const sheetTex = resourcesStore.iconsheetTexture;
  const container = new Container();
  const half = size / 2;

  // 圆形背景贴图
  const bgTex = resourcesStore.textures["bg_icon_circle"];
  const bgSprite = new Sprite(bgTex || Texture.WHITE);
  bgSprite.anchor.set(0.5, 0.5);
  bgSprite.width = size;
  bgSprite.height = size;
  container.addChild(bgSprite);

  // 物品图标 Sprite
  let sprite;
  if (iconData && sheetTex) {
    const [xStr, yStr] = iconData.position.trim().split(/\s+/);
    const x = Math.abs(parseInt(xStr));
    const y = Math.abs(parseInt(yStr));
    const frame = new Rectangle(x, y, 64, 64);
    const subTex = new Texture({ source: sheetTex.source, frame });
    sprite = new Sprite(subTex);
  } else {
    sprite = new Sprite(Texture.WHITE);
    sprite.tint = 0x888888;
  }
  sprite.anchor.set(0.5, 0.5);
  sprite.width = size;
  sprite.height = size;
  container.addChild(sprite);

  return container;
}

class MachineContainer extends Container {
  constructor(machine) {
    super();
    this.machine = machine;
    const cellSize = getCellSize();
    this.cellWidth = cellSize.width;
    this.cellHeight = cellSize.height;
    this.machineWidth = machine.gridWidth * this.cellWidth;
    this.machineHeight = machine.gridHeight * this.cellHeight;

    const { x, y } = gridToPixel(machine.gridX, machine.gridY);

    this.portContainer = new Container();
    this.uiContainer = new Container();
    this.addChild(this.portContainer);
    this.addChild(this.uiContainer);

    // 虚方法：默认按 overlay 配置渲染，子类可整体重写
    this.renderBody();

    this.setPivotAndPosition(machine, x, y);
    this.setupScaleVisibility();
  }

  /* ======== 机器主体渲染（虚方法，子类可整体重写） ======== */
  renderBody() {
    // 配置了贴图覆盖的特殊机器：跳过端口与背景渲染，直接整张贴图覆盖
    const overlay = useResourcesStore().machineOverlays[this.machine.type];
    if (overlay) {
      this.overlay = overlay;
      this.renderOverlayTexture();
      if (overlay.port) {
        this.renderPorts(this.machine);
      }
      if (overlay.background) {
        this.renderBackground();
      }
      this.renderUI(overlay.recipe, overlay.name);
    } else {
      this.renderPorts(this.machine);
      this.renderBackground();
      this.renderUI();
    }
  }

  /* ======== 端口渲染 ======== */
  renderPorts(machine) {
    const resourcesStore = useResourcesStore();
    const storageStore = useStorageStore();
    const mask = machine.mask || machine.defaultMask;
    if (!mask) return;

    for (let row = 0; row < mask.length; row++) {
      for (let col = 0; col < mask[row].length; col++) {
        const cell = mask[row][col];
        if (cell === "ma") continue;

        const [type, dir] = cell.split(".");
        let entry;
        if (type === "bi" || type === "bo") {
          const kind = type === "bi" ? "in" : "out";
          entry = resourcesStore.beltPorts[`${kind}.${dir}`];
        } else if (type === "pi" || type === "po") {
          const kind = type === "pi" ? "in" : "out";
          entry = resourcesStore.pipePorts[`${kind}.${dir}`];
        }
        if (!entry) continue;

        const sprite = new Sprite(entry.texture);
        sprite.anchor.set(0.5, 0.5);
        sprite.rotation = entry.rotation;
        const scale = Math.min(
          this.cellWidth / sprite.texture.width,
          this.cellHeight / sprite.texture.height,
        );
        sprite.scale.set(scale);

        const factor =
          type === "bi" || type === "bo"
            ? storageStore.default_belt_port_offset
            : storageStore.default_pipe_port_offset;
        const offset = getPortOffset(
          type,
          dir,
          this.cellWidth,
          this.cellHeight,
          factor,
        );
        sprite.x = col * this.cellWidth + this.cellWidth / 2 + offset.x;
        sprite.y = row * this.cellHeight + this.cellHeight / 2 + offset.y;
        this.portContainer.addChild(sprite);
      }
    }
  }

  /* ======== 轴心 & 像素位置 ======== */
  setPivotAndPosition(machine, px, py) {
    this.pivot.set(
      machine.anchor[machine.rotation].x * this.machineWidth,
      machine.anchor[machine.rotation].y * this.machineHeight,
    );
    this.position.set(px, py);
  }

  /* ======== 背景（装饰底图 + 描边 + 背景图标） ======== */
  renderBackground() {
    const resourcesStore = useResourcesStore();
    const bg = new Container();

    // 描边
    const gfx = new Graphics();
    gfx.rect(0, 0, this.machineWidth, this.machineHeight);
    gfx.stroke({ width: 2, color: 0x212121 });
    bg.addChild(gfx);

    // 背景大图标
    const iconTex = resourcesStore.machineIcons[this.machine.type];
    if (iconTex) {
      const icon = new Sprite(iconTex);
      icon.anchor.set(0.5, 0.5);
      icon.x = this.machineWidth / 2;
      icon.y = this.machineHeight / 2;
      icon.alpha = 0.5;
      const iconScale =
        Math.min(
          this.machineWidth / iconTex.width,
          this.machineHeight / iconTex.height,
        ) - 0.2;
      icon.scale.set(iconScale);
      bg.addChild(icon);
    }

    this.addChildAt(bg, 0);
  }

  /* ======== 贴图覆盖（特殊机器，替代背景渲染） ======== */
  renderOverlayTexture() {
    const resourcesStore = useResourcesStore();
    const overlay = resourcesStore.machineOverlays[this.machine.type];
    if (!overlay) return;

    // 优先取 machineIcons，其次取 textures
    const tex =
      resourcesStore.machineIcons[overlay.texture] ||
      resourcesStore.textures[overlay.texture];
    if (!tex) return;
    const sprite = new Sprite(tex);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = this.machineWidth / 2;
    sprite.y = this.machineHeight / 2;
    // 等比覆盖：取较大缩放比，保持比例且盖满机器（允许溢出机器边界）
    const scale =
      this.machine.rotation % 2 == 0
        ? Math.min(
            this.machineWidth / tex.width,
            this.machineHeight / tex.height,
          )
        : Math.min(
            this.machineWidth / tex.height,
            this.machineHeight / tex.width,
          );
    sprite.scale.set(scale);
    // 基础旋转 + 跟随 machine.port_offset_index（0-3 循环，每次 90°）
    sprite.rotation =
      (overlay.rotation || 0) +
      (this.machine.port_offset_index ?? 0) * (Math.PI / 2);
    this.addChildAt(sprite, 0);
  }

  /* ======== UI（机器名称 + 配方图标） ======== */
  renderUI(recipe = true, name = true) {
    const { machineWidth, machineHeight, cellWidth, cellHeight } = this;
    const cx = machineWidth / 2;
    const cy = machineHeight / 2;

    // 机器名称
    if (this.machine.name && name) {
      this.nameText = new Text({
        fontFamily: "SimHei",
        text: this.machine.name,
        style: {
          fontSize: Math.min(cellWidth, cellHeight) * 0.35,
          fill: 0x000000,
        },
      });
      this.nameText.anchor.set(0.5, 0.5);
      this.nameText.x = cx;
      this.nameText.y = cy;
      this.uiContainer.addChild(this.nameText);
    }

    // 配方图标
    if (recipe) {
      this.recipeContainer = new Container();
      this.uiContainer.addChild(this.recipeContainer);
      this.renderRecipeUI();
    }
  }

  /** 只重新渲染配方图标部分（不清除名称和布局） */
  refreshUI() {
    // 清除旧的配方容器
    if (!this.overlay.recipe) return; 
    if (this.recipeContainer) {
      this.uiContainer.removeChild(this.recipeContainer);
      this.recipeContainer.destroy({ children: true });
    }
    this.recipeContainer = new Container();
    this.uiContainer.addChild(this.recipeContainer);
    this.renderRecipeUI();
  }

  /** 渲染配方图标的内部逻辑，使用 machine.now_recipe */
  renderRecipeUI() {
    const resourcesStore = useResourcesStore();
    const { machine, machineWidth, machineHeight, cellWidth, cellHeight } =
      this;
    const cx = machineWidth / 2;
    const cy = machineHeight / 2;

    // 配方图标
    const recipeIds = machine.recipe_id;
    if (!recipeIds || recipeIds.length === 0) return;
    const recipe = resourcesStore.recipes[machine.now_recipe || recipeIds[0]];
    if (!recipe) return;

    const inIds = Object.keys(recipe.in || {});
    const outIds = Object.keys(recipe.out || {});
    const inLen = inIds.length;
    const outLen = outIds.length;
    const iconSize = Math.min(cellWidth, cellHeight);
    const gap = iconSize * 0.8;
    const vgap = iconSize * 0.6;

    const place = (itemId, px, py) => {
      const icon = createItemIcon(itemId, resourcesStore, iconSize);
      icon.x = px;
      icon.y = py;
      this.recipeContainer.addChild(icon);
    };

    if (inLen === 0) {
      // 无输入：所有输出居中
      for (let i = 0; i < Math.min(outLen, 2); i++) {
        place(outIds[i], cx, outLen === 1 ? cy : cy + (i === 0 ? -vgap : vgap));
      }
    } else if (outLen === 0) {
      // 无输出：所有输入居中
      for (let i = 0; i < Math.min(inLen, 2); i++) {
        place(inIds[i], cx, inLen === 1 ? cy : cy + (i === 0 ? -vgap : vgap));
      }
    } else {
      // 双列布局：左列输入，右列输出，各自垂直居中
      const leftX = cx - gap * 0.7;
      const rightX = cx + gap * 0.7;
      for (let i = 0; i < Math.min(inLen, 2); i++) {
        place(
          inIds[i],
          leftX,
          inLen === 1 ? cy : cy + (i === 0 ? -vgap : vgap),
        );
      }
      for (let i = 0; i < Math.min(outLen, 2); i++) {
        place(
          outIds[i],
          rightX,
          outLen === 1 ? cy : cy + (i === 0 ? -vgap : vgap),
        );
      }
    }
  }

  /* ======== scale 驱动的配方显隐 ======== */
  setupScaleVisibility() {
    const storageStore = useStorageStore();
    const THRESHOLD = 1.2;

    const update = (scale) => {
      const show = scale >= THRESHOLD;
      this.recipeContainer.visible = show;
      if (this.nameText) this.nameText.alpha = show ? 0.7 : 1.0;
    };

    update(storageStore.scale);
    storageStore.$subscribe(() => {
      update(storageStore.scale);
    });
  }
}

export { MachineContainer };
