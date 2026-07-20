import { getMachineMaskTypeByPosition } from "../core_storage/MachineStorage.js";
import { getPipeByPosition } from "../core_storage/PipeStorage.js";
import { getBeltByPosition } from "../core_storage/BeltStorage.js";
import { useBeltStore } from "../stores/BeltStore.js";
import { usePipeStore } from "../stores/PipeStore.js";

function proxyForHandle(func, name) {
  let lastCall = 0;
  return function () {
    const now = Date.now();
    if (now - lastCall < 300) return;
    lastCall = now;
    func(name.toLowerCase());
    console.log(name);
  };
}

function directionConstraint(gridX, gridY, startX, startY, pipeOrBeltMode) {
  function returnDefault() {
    return {
      process_grid_x: gridX,
      process_grid_y: gridY,
    };
  }

  const beltStore = useBeltStore();
  const belt = getBeltByPosition(startX, startY);
  const pipe = getPipeByPosition(startX, startY);
  const entity = belt || pipe;
  if (!entity || !beltStore.nodeTypes.has(entity.type)) return returnDefault();

  const outDirs =
    entity.type === "cross"
      ? ["up", "down", "left", "right"]
      : entity.out.split("|");

  let px = gridX;
  let py = gridY;

  const vDir = py > startY ? "down" : py < startY ? "up" : null;
  const hDir = px > startX ? "right" : px < startX ? "left" : null;

  if (pipeOrBeltMode) {
    // 垂直优先
    if (py == startY) {
      //console.log(vDir, hDir, pipeOrBeltMode, outDirs, entity);
      // 垂直无偏移 -> 有效第一方向是第二段（水平）
      if (hDir && !outDirs.includes(hDir)) {
        px = startX;
        py = startY;
      }
    } else if (vDir && !outDirs.includes(vDir)) {
      px = startX;
      py = startY;
    }
  } else {
    // 水平优先
    if (px == startX) {
      // 水平无偏移 -> 有效第一方向是第二段（垂直）
      if (vDir && !outDirs.includes(vDir)) {
        px = startX;
        py = startY;
      }
    } else if (hDir && !outDirs.includes(hDir)) {
      px = startX;
      py = startY;
    }
  }

  return { process_grid_x: px, process_grid_y: py };
}

function scanAdjacentPort(gridX, gridY, reverse = false) {
  const dirs = [
    { dx: 0, dy: -1, dir: "up" },
    { dx: 0, dy: 1, dir: "down" },
    { dx: -1, dy: 0, dir: "left" },
    { dx: 1, dy: 0, dir: "right" },
  ];
  const reverse_dirs = [
    { dx: 0, dy: -1, dir: "down" },
    { dx: 0, dy: 1, dir: "up" },
    { dx: -1, dy: 0, dir: "right" },
    { dx: 1, dy: 0, dir: "left" },
  ];
  for (const { dx, dy, dir } of reverse ? reverse_dirs : dirs) {
    const maskType = getMachineMaskTypeByPosition(gridX + dx, gridY + dy);
    if (maskType == null) {
      return {
        offsetX: dx,
        offsetY: dy,
        dir,
      };
    }
  }
  return {
    offsetX: null,
    offsetY: null,
    dir: null,
  };
}

export { proxyForHandle, scanAdjacentPort, directionConstraint };
