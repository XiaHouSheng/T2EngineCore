import { pixelToGridNoneOffset } from "../core_middleware/PositionConvert.js";
import { useStorageStore } from "../stores/StorageStore.js";

// 映射机器区域
function mapMachineArea(machine, func, use_center = false) {
  const storageStore = useStorageStore();
  const cellWidth = storageStore.cellWidth;
  const cellHeight = storageStore.cellHeight;
  const {leftTopX, leftTopY} = use_center ? getLeftTopPositionByCenter(machine) : getLeftTopPosition(machine);
  const originX = Number.parseInt(leftTopX);
  const originY = Number.parseInt(leftTopY);
  const startGridX = Number.parseInt(originX / cellWidth);
  const startGridY = Number.parseInt(originY / cellHeight);
  for (let i = 0; i < machine.gridWidth; i++) {
    for (let j = 0; j < machine.gridHeight; j++) {
      func(startGridX + i, startGridY + j, machine.mask[j][i]);
    }
  }
}

// 获取机器的像素长宽
function getMachinePixelSize(machine) {
  const storageStore = useStorageStore();
  const cellWidth = storageStore.cellWidth;
  const cellHeight = storageStore.cellHeight;
  const machineWidth = machine.gridWidth * cellWidth;
  const machineHeight = machine.gridHeight * cellHeight;
  return {
    machineWidth,
    machineHeight,
  };
}

// 获取机器左上角像素坐标（根据中心坐标）
function getLeftTopPositionByCenter(machine) {
  // machine.centerX, machine.centerY -> machine.leftTopX, machine.leftTopY
  const { machineWidth, machineHeight } = getMachinePixelSize(machine);
  const leftTopX = machine.centerX - machineWidth / 2;
  const leftTopY = machine.centerY - machineHeight / 2;
  return {
    leftTopX,
    leftTopY,
  };
}

// 获取机器左上角像素坐标（根据锚点坐标）通用方法
function getLeftTopPosition(machine) {
  const { machineWidth, machineHeight } = getMachinePixelSize(machine);
  const pivotX = machine.anchor[machine.rotation].x * machineWidth;
  const pivotY = machine.anchor[machine.rotation].y * machineHeight;
  const leftTopX = machine.x - pivotX;
  const leftTopY = machine.y - pivotY;
  return {
    leftTopX,
    leftTopY,
  };
}

// 获取机器中心像素坐标（根据锚点坐标）通用方法
function getMachineCenterPixel(machine) {
  const { machineWidth, machineHeight } = getMachinePixelSize(machine);
  const { leftTopX, leftTopY } = getLeftTopPosition(machine);
  return {
    centerX: leftTopX + machineWidth / 2,
    centerY: leftTopY + machineHeight / 2,
  };
}

// 重新计算获取机器网格坐标
function getMachineGridPosition(machine) {
  // machine.centerX, machine.centerY -> machine.gridX, machine.gridY
  const { machineWidth, machineHeight } = getMachinePixelSize(machine);
  const { leftTopX, leftTopY } = getLeftTopPositionByCenter(machine);
  const machinePivotX = machine.anchor[machine.rotation].x * machineWidth;
  const machinePivotY = machine.anchor[machine.rotation].y * machineHeight;
  const { gridX, gridY } = pixelToGridNoneOffset(
    leftTopX + machinePivotX,
    leftTopY + machinePivotY,
  );
  return {
    gridX,
    gridY,
  };
}

// 根据网格坐标获取机器
function getMachineByPosition(grid_x, grid_y) {
  const storageStore = useStorageStore();
  const machine_type =
    storageStore.machineLocations?.[grid_y - 1]?.[grid_x - 1];
  if (machine_type == undefined) {
    return null;
  }
  return storageStore.machines[machine_type.split(".")[0]];
}

// 保存机器
function saveMachine(machine, machine_container) {
  const storageStore = useStorageStore();
  // 这个是Location坐标
  machine.x = machine_container.position.x;
  machine.y = machine_container.position.y;
  const { centerX, centerY } = getMachineCenterPixel(machine);
  machine.centerX = centerX;
  machine.centerY = centerY;
  storageStore.machines[machine.id] = machine;
  storageStore.machineObjects[machine.id] = machine_container;
  mapMachineArea(machine, (x, y, maskType) => {
    storageStore.machineLocations[y][x] = `${machine.id}.${maskType}`;
  });
  //console.log(storageStore.machineLocations); 
}

// 删除机器
function dropMachine(machine) {
  const storageStore = useStorageStore();
  const machine_container = storageStore.machineObjects[machine.id];
  mapMachineArea(machine, (x, y) => {
    storageStore.machineLocations[y][x] = null;
  });
  delete storageStore.machines[machine.id];
  delete storageStore.machineObjects[machine.id];
  return machine_container;
}

export {
  saveMachine,
  dropMachine,
  getMachineByPosition,
  getMachineGridPosition,
  mapMachineArea,
};
