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

function scanAdjacentPort(gridX, gridY) {
  const maskType = getMachineMaskTypeByPosition(gridX, gridY);
  if (!maskType || !maskType.includes(".")) {
    return { offsetX: null, offsetY: null, dir: null };
  }
  const [type_, dir] = maskType.split(".");
  const outputTypes = ["po", "bo"];
  const dirToOffset = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  };
  const opposite = { up: "down", down: "up", left: "right", right: "left" };
  const offset = outputTypes.includes(type_) ? dirToOffset[dir] : dirToOffset[opposite[dir]];
  if (!offset) return { offsetX: null, offsetY: null, dir: null };
  return { offsetX: offset.dx, offsetY: offset.dy, dir };
}

export { proxyForHandle, scanAdjacentPort, directionConstraint };
