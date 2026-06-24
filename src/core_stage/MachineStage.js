import { machineContainer } from "../core_stage/SimStage.js";
import { NineSliceSprite, Texture } from "pixi.js";
import { gridToPixel } from "../core_middleware/PositionConvert.js";

const textTexture = new Texture();

// 绘制机器
function drawMachine(machine) {
  const {x, y} = gridToPixel(machine.gridX, machine.gridY);
  const machineSprite = new NineSliceSprite({
    texture: textTexture,
    width: machine.width,
    height: machine.height,
  });
  machineSprite.anchor.set(0);
  machineSprite.position.set(x, y);
  machineSprite.rotation = Math.PI * machine.rotation;
  machineContainer.addChild(machineSprite);
}

// 旋转机器
function rotateDrawMachine() {}

export { drawMachine, rotateDrawMachine };
