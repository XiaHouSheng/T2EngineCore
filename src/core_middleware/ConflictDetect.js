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

function detectOnPlaceFinalIsNode(baseGridX, baseGridY, endX, endY, pipeOrBeltMode, is_belt = true) {
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

  // 只检查同种类型的 entity
  const entity = is_belt ? getBeltByPosition(endX, endY) : getPipeByPosition(endX, endY);
  console.log(entity);
  if (!entity) return false;

  const inDirs = entity.type === "cross"
    ? ["up", "down", "left", "right"]
    : entity.in.split("|");

  return inDirs.includes(finalDir);
}

function detectOnPlaceFinalIsPort(baseGridX, baseGridY, endX, endY, pipeOrBeltMode, is_belt = true) {
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

  // 只检查同种类型的 entity
  const beltPorts = ["bo", "bi"];
  const entity = getMachineMaskTypeByPosition(endX, endY);
  if (!entity) return false;
  if (!entity.includes(".")) return false;
  const [type_, dir] = entity.split(".");
  if (beltPorts.includes(type_) && is_belt && dir === finalDir) return true;
  if (!beltPorts.includes(type_) && !is_belt && dir === finalDir) return true;
  return false;
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

function getPlaceDirAt(gridX, gridY, baseX, baseY, nowX, nowY, pipeOrBeltMode) {
  if (baseX === nowX) {
    return nowY > baseY ? "down" : "up";
  }
  if (baseY === nowY) {
    return nowX > baseX ? "right" : "left";
  }
  const crossX = pipeOrBeltMode ? baseX : nowX;
  const crossY = pipeOrBeltMode ? nowY : baseY;
  if (pipeOrBeltMode) {
    // 第一段：垂直
    if (gridX === baseX && gridY >= Math.min(baseY, crossY) && gridY <= Math.max(baseY, crossY)) {
      return nowY > baseY ? "down" : "up";
    }
    // 第二段：水平
    if (gridY === crossY && gridX >= Math.min(crossX, nowX) && gridX <= Math.max(crossX, nowX)) {
      return nowX > crossX ? "right" : "left";
    }
  } else {
    // 第一段：水平
    if (gridY === baseY && gridX >= Math.min(baseX, crossX) && gridX <= Math.max(baseX, crossX)) {
      return nowX > baseX ? "right" : "left";
    }
    // 第二段：垂直
    if (gridX === crossX && gridY >= Math.min(crossY, nowY) && gridY <= Math.max(crossY, nowY)) {
      return nowY > crossY ? "down" : "up";
    }
  }
  return null;
}

function detectOnPlaceBatch(indicatorGraphics, is_belt = true, baseX = 0, baseY = 0, nowX = 0, nowY = 0, pipeOrBeltMode = true) {
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
      const maskTypeRaw = getMachineMaskTypeByPosition(graphic.gridX, graphic.gridY);
      const maskType = maskTypeRaw ? maskTypeRaw.split(".")[0] : undefined;
      const allowedPorts = is_belt ? ["bo", "bi"] : ["po", "pi"];
      const detect = detectOnPlaceFinalIsPort(baseX, baseY, nowX, nowY, pipeOrBeltMode, is_belt);
      if (!allowedPorts.includes(maskType)) {
        metaConflict.machines[machine.id] = machine;
      }
      if (allowedPorts.includes(maskType) && !detect) {
        metaConflict.machines[machine.id] = machine;
      }
    }
    // 放置belt且该区域有belt的node时，方向匹配则放行
    if (belt_ && is_belt && belt_.type !== "default") {
      const detect = detectOnPlaceFinalIsNode(baseX, baseY, nowX, nowY, pipeOrBeltMode, is_belt);
      if (!detect) {
        metaConflict.belts[belt_.id] = belt_;
      }
    }
    // 放置belt且该区域已有default直线belt时，垂直方向放行由下层处理交叉
    if (belt_ && is_belt && belt_.type === "default") {
      const newDir = getPlaceDirAt(graphic.gridX, graphic.gridY, baseX, baseY, nowX, nowY, pipeOrBeltMode);
      if (!(newDir && belt_.in === belt_.out &&
            (new Set(["up", "down"])).has(newDir) !== (new Set(["up", "down"])).has(belt_.in))) {
        metaConflict.belts[belt_.id] = belt_;
      }
    }
    // 放置belt但是该区域有pipe的特殊node时，不能放置
    if (pipe_ && is_belt && pipe_.type != "default") {
      metaConflict.pipes[pipe_.id] = pipe_;
    }
    // 放置pipe但是该区域有belt的特殊node时，不能放置
    if (belt_ && !is_belt && belt_.type != "default") {
      metaConflict.belts[belt_.id] = belt_;
    }
    // 放置pipe且该区域有pipe的node时，方向匹配则放行
    if (pipe_ && !is_belt && pipe_.type !== "default") {
      const detect = detectOnPlaceFinalIsNode(baseX, baseY, nowX, nowY, pipeOrBeltMode, is_belt);
      if (!detect) {
        metaConflict.pipes[pipe_.id] = pipe_;
      }
    }
    // 放置pipe且该区域已有default直线pipe时，垂直方向放行由下层处理交叉
    if (pipe_ && !is_belt && pipe_.type === "default") {
      const newDir = getPlaceDirAt(graphic.gridX, graphic.gridY, baseX, baseY, nowX, nowY, pipeOrBeltMode);
      if (!(newDir && pipe_.in === pipe_.out &&
            (new Set(["up", "down"])).has(newDir) !== (new Set(["up", "down"])).has(pipe_.in))) {
        metaConflict.pipes[pipe_.id] = pipe_;
      }
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
