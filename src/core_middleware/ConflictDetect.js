import { useStorageStore } from "../stores/StorageStore.js";
import {
  mapMachineArea,
  getMachineByPosition,
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

function detectOnMoveMask(metaRotateMove, gridDeltaX, gridDeltaY) {
  //machine 不能和belt以及pipe重叠
  const metaConflict = {
    machines: {},
    belts: {},
    pipes: {},
  };
  const { machines, belts, pipes } = metaRotateMove;
  // 检查machine范围内是否有belt/pipe重叠
  Object.values(machines).forEach((machine) => {
    mapMachineArea(
      machine,
      (x, y, maskType) => {
        // 旋转后 machine.x/y 可能过期，始终用 centerX/Y
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
  // 检查belt/pipe范围内是否有machine/belt/pipe重叠
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

function detectOnPlaceBatch(indicatorGraphics, is_belt = true) {
  const metaConflict = {
    machines: {},
    belts: {},
    pipes: {},
  };
  indicatorGraphics.forEach((graphic) => {
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
      metaConflict.machines[machine.id] = machine;
    }
    if (belt_ && is_belt) {
      metaConflict.belts[belt_.id] = belt_;
    }
    if (pipe_ && !is_belt) {
      metaConflict.pipes[pipe_.id] = pipe_;
    }
  });
  return metaConflict;
}

export {
  detectOnPlaceMachine,
  detectOnPlacePipe,
  detectOnPlaceBelt,
  detectOnMoveMask,
  detectOnPlaceBatch,
};
