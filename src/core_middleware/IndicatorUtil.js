import { getMachineMaskTypeByPosition } from "../core_storage/MachineStorage.js";

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

export { proxyForHandle, scanAdjacentPort };
