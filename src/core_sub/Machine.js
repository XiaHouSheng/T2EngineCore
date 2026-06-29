import { saveMachine, dropMachine } from "../core_middleware/MachineStorage.js";
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
function placeMachine(machine, x, y) {
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
  machine.gridWidth = rows;
  machine.gridHeight = cols;
  machine.rotation = machine.rotation === 0 ? 1 : 0;
  return machine;
}

function deleteMachine(machine) {
  dropDrawMachine(dropMachine(machine));
  return machine;
}

export { createMachine, placeMachine, deleteMachine, rotateMachine };
