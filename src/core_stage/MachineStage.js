import { machineRootContainer } from "../core_stage/SimStage.js";
import { MachineContainer } from "../core_container_sub/MachineContainer.js";
import { useMachineStore } from "../stores/MachineStore.js";
import { useStorageStore } from "../stores/StorageStore.js";

let scaleListenerStarted = false;

// 全局唯一的 scale 监听：只响应 scale 变化，统一分发给所有机器容器
function setupMachineScaleListener() {
  if (scaleListenerStarted) return;
  scaleListenerStarted = true;
  const storageStore = useStorageStore();
  let lastScale = storageStore.scale;
  storageStore.$subscribe(() => {
    const scale = storageStore.scale;
    // 仅当 scale 实际变化才分发（offset_position 等其它状态变化直接跳过）
    if (scale === lastScale) return;
    lastScale = scale;
    for (const child of machineRootContainer.children) {
      if (typeof child.onScaleChange === "function") {
        child.onScaleChange(scale);
      }
    }
  });
}

// 绘制机器
function drawMachine(machine) {
  setupMachineScaleListener();
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

export { drawMachine, dropDrawMachine, setupMachineScaleListener };
