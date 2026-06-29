import { machineRootContainer } from "../core_stage/SimStage.js";
import { MachineContainer } from "../core_container_sub/MachineContainer.js";

// 绘制机器
function drawMachine(machine) {
  const machineContainer = new MachineContainer(machine);
  machineRootContainer.addChild(machineContainer);
  return machineContainer;
}

// 视觉上移除机器
function dropDrawMachine(machine_container) {
  machineRootContainer.removeChild(machine_container);
}

export { drawMachine, dropDrawMachine };
