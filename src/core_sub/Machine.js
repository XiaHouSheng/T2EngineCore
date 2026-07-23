import { saveMachine, dropMachine, getMachineGridPosition } from "../core_storage/MachineStorage.js";
import { drawMachine, dropDrawMachine } from "../core_stage/MachineStage.js";
import { useMachineStore } from "../stores/MachineStore.js";
import { detectOnPlaceMachine } from "../core_middleware/ConflictDetect.js";
import { nanoid } from "nanoid";
/**
 * 创建机器
 * @param {
 *     id: string,
 *     type: string,
 *     x: number,
 *     y: number,
 *     width: number,
 *     height: number,
 *     rotation: number,
 *     anchor: {
 *       x: number,
 *       y: number,
 *     },
 *     gridWidth: number,
 *     gridHeight: number,
 *     gridX: number,
 *     gridY: number,
 *     x: number,
 *     y: number,
 *
 * } machine 机器对象
 * @returns 机器对象
 */

// 创建机器
function createMachine(typename) {
  const machineStore = useMachineStore();
  const { gridWidth, gridHeight, anchor, mask } =
    machineStore.machineTypes[typename];
  const machine = {};
  machine.id = nanoid();
  machine.type = typename;
  machine.rotation = 0;
  machine.anchor = anchor;
  machine.gridWidth = gridWidth;
  machine.gridHeight = gridHeight;
  machine.mask = mask;
  return machine;
}

// 注入position
function placeMachine(machine, x, y, is_copy = false) {
  // 如果是复制操作，生成新的 id
  if (is_copy) machine.id = nanoid();
  machine.gridX = x;
  machine.gridY = y;
  detectOnPlaceMachine(machine);
  saveMachine(machine, drawMachine(machine));
  return machine;
}

function rotateMachine(machine) {
  const rows = machine.mask.length;
  const cols = machine.mask[0].length;
  const res = Array.from({ length: cols }, () => []);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      res[c][rows - 1 - r] = machine.mask[r][c];
    }
  }
  machine.mask = res;
  // 旋转 port 的方向后缀 (bo.down → bo.right)
  const portRotateMap = { up: "right", down: "left", left: "up", right: "down" };
  for (let r = 0; r < machine.mask.length; r++) {
    for (let c = 0; c < machine.mask[r].length; c++) {
      const cell = machine.mask[r][c];
      if (cell && cell.includes(".")) {
        const [type, dir] = cell.split(".");
        machine.mask[r][c] = `${type}.${portRotateMap[dir] || dir}`;
      }
    }
  }
  machine.gridWidth = rows;
  machine.gridHeight = cols;
  machine.rotation = machine.rotation === 0 ? 1 : 0;
  return machine;
}

function rotateMachineByCenter(machine, x, y) {
  // 计算旋转后的中心点坐标（顺时针 90°）
  const rotateX = x + y - machine.centerY;
  const rotateY = y - x + machine.centerX;
  machine.centerX = rotateX;
  machine.centerY = rotateY;
  // Mask旋转
  machine = rotateMachine(machine);
  // 重新计算网格坐标
  const { gridX, gridY } = getMachineGridPosition(machine);
  machine.gridX = gridX;
  machine.gridY = gridY;
  return machine;
}

function deleteMachine(machine) {
  dropDrawMachine(dropMachine(machine));
  return machine;
}

export {
  createMachine,
  placeMachine,
  deleteMachine,
  rotateMachine,
  rotateMachineByCenter,
};
