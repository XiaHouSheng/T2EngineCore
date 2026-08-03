import { machineRootContainer } from "../core_stage/SimStage.js";
import { MachineContainer } from "../core_container_sub/MachineContainer.js";
import { useMachineStore } from "../stores/MachineStore.js";

// 绘制机器
function drawMachine(machine) {
  const machineStore = useMachineStore();
  // 按机器类型分派到自定义容器类，未注册则使用默认 MachineContainer
  const ContainerClass =
    machineStore.machineContainerClasses[machine.type] || MachineContainer;
  const machineContainer = new ContainerClass(machine);
  machineRootContainer.addChild(machineContainer);
  return machineContainer;
}

// 视觉上移除机器
function dropDrawMachine(machine_container) {
  machineRootContainer.removeChild(machine_container);
}

export { drawMachine, dropDrawMachine };
