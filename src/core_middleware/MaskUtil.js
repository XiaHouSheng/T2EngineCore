/**
 * 机器 mask 单元格解析工具
 * 旧格式: "bi.down"（类型.方向）
 * 新格式: "pi.right.p1"（类型.方向.端口id）
 */

// 端口方向顺时针旋转 90° 的映射
const portRotateMap = {
  up: "right",
  down: "left",
  left: "up",
  right: "down",
};

/**
 * 解析 mask 单元格
 * @param {string} cell - mask 单元格，如 "ma" / "bi.down" / "pi.right.p1"
 * @returns {{ type?: string, dir?: string, portId?: string } | null}
 *          "ma" 或无方向信息时返回 null
 */
function parseMaskCell(cell) {
  if (!cell || !cell.includes(".")) return null;
  const [type, dir, portId] = cell.split(".");
  return { type, dir, portId: portId || undefined };
}

/**
 * 构建 mask 单元格字符串（可选端口 id，兼容两段式）
 * @param {string} type - bi/bo/pi/po
 * @param {string} dir - 方向
 * @param {string} [portId] - 端口 id
 */
function buildMaskCell(type, dir, portId) {
  return portId ? `${type}.${dir}.${portId}` : `${type}.${dir}`;
}

/**
 * 顺时针旋转 90° 整个 mask
 * 同时重映射端口方向并保留端口 id（bo.down.p1 → bo.left.p1）
 * @param {string[][]} mask - 旋转前的 mask
 * @returns {string[][]} 旋转后的新 mask
 */
function rotateMask(mask) {
  const rows = mask.length;
  const cols = mask[0].length;
  const res = Array.from({ length: cols }, () => []);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      res[c][rows - 1 - r] = mask[r][c];
    }
  }
  for (let r = 0; r < res.length; r++) {
    for (let c = 0; c < res[r].length; c++) {
      const parsed = parseMaskCell(res[r][c]);
      if (!parsed) continue;
      const newDir = portRotateMap[parsed.dir] || parsed.dir;
      res[r][c] = buildMaskCell(parsed.type, newDir, parsed.portId);
    }
  }
  return res;
}

export { parseMaskCell, buildMaskCell, portRotateMap, rotateMask };
