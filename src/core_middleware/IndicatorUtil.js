import { getMachineMaskTypeByPosition } from "../core_storage/MachineStorage.js";
import { getPipeByPosition } from "../core_storage/PipeStorage.js";
import { getBeltByPosition } from "../core_storage/BeltStorage.js";
import { useBeltStore } from "../stores/BeltStore.js";
import { usePipeStore } from "../stores/PipeStore.js";
import { parseMaskCell } from "./MaskUtil.js";

function proxyForHandle(func, name, time_ = 300) {
  let lastCall = 0;
  return function () {
    const now = Date.now();
    if (now - lastCall < time_) return;
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
  const parsed = parseMaskCell(maskType);
  if (!parsed) {
    return { offsetX: null, offsetY: null, dir: null };
  }
  const { type: type_, dir } = parsed;
  const outputTypes = ["po", "bo"];
  const dirToOffset = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  };
  const opposite = { up: "down", down: "up", left: "right", right: "left" };
  const offset = outputTypes.includes(type_)
    ? dirToOffset[dir]
    : dirToOffset[opposite[dir]];
  if (!offset) return { offsetX: null, offsetY: null, dir: null };
  return { offsetX: offset.dx, offsetY: offset.dy, dir };
}

/**
 * 创建可取消的延迟调用器（防抖启动）
 * 适用于长按检测等场景：先 cancel 再 start，保证只有一个待执行回调
 * @param {number} delayMs 延迟毫秒数，默认 300
 * @returns {{ start: (fn: Function) => void, cancel: () => void, isPending: () => boolean }}
 */
function makeDebouncedDelay(delayMs = 300) {
  let _timer = null;
  const cancel = () => {
    if (_timer !== null) {
      clearTimeout(_timer);
      _timer = null;
    }
  };
  const start = (fn) => {
    cancel();
    _timer = setTimeout(() => {
      _timer = null;
      fn();
    }, delayMs);
  };
  const isPending = () => _timer !== null;
  return { start, cancel, isPending };
}

/**
 * 点击检测器：pointerdown 启动计时器，pointerup 时若仍在阈值内则执行回调
 * 计时器到期后自动失效，cancel(true) 不会触发执行
 * @param {number} delayMs 阈值毫秒数
 * @returns {{ start: (fn: Function) => void, cancel: (execNow?: boolean) => void, isPending: () => boolean }}
 */
function makeClickDetector(delayMs = 300) {
  let _timer = null;
  let _cb = null;
  const cancel = (execNow = false) => {
    if (execNow && isPending() && _cb) {
      _cb();
    }
    if (_timer !== null) {
      clearTimeout(_timer);
      _timer = null;
    }
    _cb = null;
  };
  const start = (fn) => {
    cancel();
    _cb = fn;
    _timer = setTimeout(() => {
      _timer = null;
      _cb = null;
    }, delayMs);
  };
  const isPending = () => _timer !== null;
  return { start, cancel, isPending };
}

export {
  proxyForHandle,
  scanAdjacentPort,
  directionConstraint,
  makeDebouncedDelay,
  makeClickDetector,
};
