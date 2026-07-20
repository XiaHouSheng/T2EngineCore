import { useStorageStore } from "../stores/StorageStore.js";
import {
  mapMachineArea,
  getMachineByPosition,
  getMachineMaskTypeByPosition,
} from "../core_storage/MachineStorage.js";
import { getBeltByPosition } from "../core_storage/BeltStorage.js";
import { getPipeByPosition } from "../core_storage/PipeStorage.js";

function detectOnPlaceMachine(machine) {
  const storageStore = useStorageStore();
}

function detectOnPlacePipe(machine) {
  const storageStore = useStorageStore();
}

function detectOnPlaceBelt(machine) {
  const storageStore = useStorageStore();
}

function detectOnPlaceFinalIsNode(baseGridX, baseGridY, endX, endY, pipeOrBeltMode) {
  let finalDir;
  if (baseGridX === endX) {
    finalDir = endY > baseGridY ? "down" : "up";
  } else if (baseGridY === endY) {
    finalDir = endX > baseGridX ? "right" : "left";
  } else if (pipeOrBeltMode) {
    // vertical-first, last segment is horizontal
    finalDir = endX > baseGridX ? "right" : "left";
  } else {
    // horizontal-first, last segment is vertical
    finalDir = endY > baseGridY ? "down" : "up";
  }

  const belt = getBeltByPosition(endX, endY);
  const pipe = getPipeByPosition(endX, endY);
  const entity = belt || pipe;
  if (!entity) return false;

  const inDirs = entity.type === "cross"
    ? ["up", "down", "left", "right"]
    : entity.in.split("|");

  return inDirs.includes(finalDir);
}

function detectOnMoveMask(metaRotateMove, gridDeltaX, gridDeltaY) {
  //machine cannot overlap with belt or pipe
  const metaConflict = {
    machines: {},
    belts: {},
    pipes: {},
  };
  const { machines, belts, pipes } = metaRotateMove;
  // Check if machine area overlaps with belt/pipe
  Object.values(machines).forEach((machine) => {
    mapMachineArea(
      machine,
      (x, y, maskType) => {
        // rotation may make machine.x/y stale, always use centerX/Y
        const belt = getBeltByPosition(x + gridDeltaX + 1, y + gridDeltaY + 1);
        const pipe = getPipeByPosition(x + gridDeltaX + 1, y + gridDeltaY + 1);
        if (belt) {
          metaConflict.belts[belt.id] = belt;
        }
        if (pipe) {
          metaConflict.pipes[pipe.id] = pipe;
        }
      },
      true,
    );
  });
  // Check if belt/pipe area overlaps with machine/belt/pipe
  Object.values(belts).forEach((belt) => {
    const machine = getMachineByPosition(
      belt.gridX + gridDeltaX,
      belt.gridY + gridDeltaY,
    );
    const belt_ = getBeltByPosition(
      belt.gridX + gridDeltaX,
      belt.gridY + gridDeltaY,
    );
    if (machine) {
      metaConflict.machines[machine.id] = machine;
    }
    if (belt_) {
      metaConflict.belts[belt_.id] = belt_;
    }
  });
  Object.values(pipes).forEach((pipe) => {
    const machine = getMachineByPosition(
      pipe.gridX + gridDeltaX + 1,
      pipe.gridY + gridDeltaY + 1,
    );
    const pipe_ = getPipeByPosition(
      pipe.gridX + gridDeltaX + 1,
      pipe.gridY + gridDeltaY + 1,
    );
    if (machine) {
      metaConflict.machines[machine.id] = machine;
    }
    if (pipe_) {
      metaConflict.pipes[pipe_.id] = pipe_;
    }
  });
  return metaConflict;
}

function detectOnHoverMachine(gridX, gridY) {
  const machine = getMachineByPosition(gridX, gridY);
  if (machine) {
    return machine;
  }
  return null;
}

function detectOnHoverBelt(gridX, gridY) {
  const belt = getBeltByPosition(gridX, gridY);
  if (belt) {
    return belt;
  }
  return null;
}
function detectOnHoverPipe(gridX, gridY) {
  const pipe = getPipeByPosition(gridX, gridY);
  if (pipe) {
    return pipe;
  }
  return null;
}



function detectOnPlaceBatch(indicatorGraphics, is_belt = true) {
  const metaConflict = {
    machines: {},
    belts: {},
    pipes: {},
  };
  for (let i = 0; i < indicatorGraphics.length; i++) {
    const graphic = indicatorGraphics[i];
    const machine = getMachineByPosition(
      graphic.gridX,
      graphic.gridY,
    );
    const belt_ = getBeltByPosition(
      graphic.gridX,
      graphic.gridY,
    );
    const pipe_ = getPipeByPosition(
      graphic.gridX,
      graphic.gridY,
    );
    if (machine) {
      const maskType = getMachineMaskTypeByPosition(graphic.gridX, graphic.gridY);
      const allowedPorts = is_belt ? ["bo", "bi"] : ["po", "pi"];
      if (!allowedPorts.includes(maskType)) {
        metaConflict.machines[machine.id] = machine;
      }
    }
    if (belt_ && is_belt) {
      metaConflict.belts[belt_.id] = belt_;
    }
    if (pipe_ && !is_belt) {
      metaConflict.pipes[pipe_.id] = pipe_;
    }
  }
  return metaConflict;
}

export {
  detectOnPlaceMachine,
  detectOnPlacePipe,
  detectOnPlaceBelt,
  detectOnMoveMask,
  detectOnPlaceBatch,
  detectOnHoverMachine,
  detectOnHoverBelt,
  detectOnHoverPipe,
  detectOnPlaceFinalIsNode,
};
