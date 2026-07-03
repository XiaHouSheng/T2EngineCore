import { getBeltByPosition } from "../core_storage/BeltStorage";
import { getPipeByPosition } from "../core_storage/PipeStorage";
import { getMachineByPosition } from "../core_storage/MachineStorage";
import { pixelToGridNoneOffset } from "./PositionConvert";

function getMachineByPixel(pixelX, pixelY) {
  const { gridX, gridY } = pixelToGridNoneOffset(pixelX, pixelY);
  const machine = getMachineByPosition({ gridX, gridY });
  return machine;
}

function getBeltByPixel(pixelX, pixelY) {
  const { gridX, gridY } = pixelToGridNoneOffset(pixelX, pixelY);
  const belt = getBeltByPosition({ gridX, gridY });
  return belt;
}

function getPipeByPixel(pixelX, pixelY) {
  const { gridX, gridY } = pixelToGridNoneOffset(pixelX, pixelY);
  const pipe = getPipeByPosition({ gridX, gridY });
  return pipe;
}

export { getMachineByPixel, getBeltByPixel, getPipeByPixel };

function scanGridByPixel(pixelStart, pixelEnd) {
  const { startX, startY } = pixelStart;
  const { endX, endY } = pixelEnd;
  const startGridPosition = pixelToGridNoneOffset(startX, startY);
  const endGridPosition = pixelToGridNoneOffset(endX, endY);
  const start_grid_x = Math.min(startGridPosition.gridX, endGridPosition.gridX);
  const start_grid_y = Math.min(startGridPosition.gridY, endGridPosition.gridY);
  const end_grid_x = Math.max(startGridPosition.gridX, endGridPosition.gridX);
  const end_grid_y = Math.max(startGridPosition.gridY, endGridPosition.gridY);
  const machines = {};
  const belts = {};
  const pipes = {};
  for (let y = start_grid_y; y <= end_grid_y; y++) {
    for (let x = start_grid_x; x <= end_grid_x; x++) {
      const machine = getMachineByPosition(x, y);
      if (machine !== null && !machines[machine.id]) {
        machines[machine.id] = machine;
      }
      const belt = getBeltByPosition(x, y);
      if (belt !== null && !belts[belt.id]) {
        belts[belt.id] = belt;
      }
      const pipe = getPipeByPosition(x, y);
      if (pipe !== null && !pipes[pipe.id]) {
        pipes[pipe.id] = pipe;
      }
    }
  }
  return {
    machines,
    belts,
    pipes,
  }
}

export { scanGridByPixel };
