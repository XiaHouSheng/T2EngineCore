import { saveMachine, rotateStorageMachine, dropMachine } from "../core_middleware/MachineStorage.js";
import { drawMachine, rotateDrawMachine } from "../core_stage/MachineStage.js";
import { useMachineStore } from "../stores/MachineStore.js";
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
 *     type: string,
 * } machine 机器对象
 * @returns 机器对象
 */

// 创建机器
function createMachine(type) {
    const machineStore = useMachineStore();
    const machineSize = machineStore.getMachineSize(type);
    const machine = {};
    machine.id = nanoid();
    machine.type = type;
    machine.rotation = 0;
    machine.width = machineSize.width;
    machine.height = machineSize.height;
    return machine;
}

// 注入position
function placeMachine(machine, x, y) {
    machine.gridX = x;
    machine.gridY = y;
    saveMachine(machine);
    drawMachine(machine);
    return machine;
}

function deleteMachine(id) {
    dropMachine(id);
    return id;
}

function rotateMachine(id) {
    rotateStorageMachine(id);
    rotateDrawMachine(id);
    return id;
}

export { createMachine, placeMachine, deleteMachine, rotateMachine };
