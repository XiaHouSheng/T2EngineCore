import { useStorageStore } from "../stores/StorageStore.js";

// 映射机器区域
function mapMachineArea(machine, machineCont, func) {
  const storageStore = useStorageStore();
  const cellWidth = storageStore.cellWidth;
  const cellHeight = storageStore.cellHeight;
  const { x, y } = machineCont.position;
  const { _x, _y } = machineCont.pivot;
  const originX = Number.parseInt(x - _x + cellWidth / 2);
  const originY = Number.parseInt(y - _y + cellHeight / 2);
  const startGridX = Number.parseInt(originX / cellWidth);
  const startGridY = Number.parseInt(originY / cellHeight);
  for (let i = 0; i < machine.gridWidth; i++) {
    for (let j = 0; j < machine.gridHeight; j++) {
      func(startGridX + i, startGridY + j, machine.mask[j][i]);
    }
  }
}

// 根据网格坐标获取机器
function getMachineByPosition(grid_x, grid_y) {
  const storageStore = useStorageStore();
  const machine_type = storageStore.machineLocations[grid_y - 1][grid_x - 1];
  if (machine_type === null) {
    return null;
  }
  return storageStore.machines[machine_type.split(".")[0]];
}

// 保存机器
function saveMachine(machine, machine_container) {
  const storageStore = useStorageStore();
  storageStore.machines[machine.id] = machine;
  storageStore.machineObjects[machine.id] = machine_container;
  mapMachineArea(machine, machine_container, (x, y, maskType) => {
    storageStore.machineLocations[y][x] = `${machine.id}.${maskType}`;
  });
}

// 删除机器
function dropMachine(machine) {
  const storageStore = useStorageStore();
  const machine_container = storageStore.machineObjects[machine.id];
  mapMachineArea(machine, machine_container, (x, y) => {
    storageStore.machineLocations[y][x] = null;
  });
  delete storageStore.machines[machine.id];
  delete storageStore.machineObjects[machine.id];
  return machine_container;
}

export { saveMachine, dropMachine, getMachineByPosition };
