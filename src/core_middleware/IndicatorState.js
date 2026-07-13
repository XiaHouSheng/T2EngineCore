import { useStorageStore } from "../stores/StorageStore.js";
import {
  placeMachine,
} from "../core_sub/Machine.js";
import {
  placeBelt,
} from "../core_sub/Belt.js";
import {
  placePipe,
} from "../core_sub/Pipe.js";
import {
  drawMask,
  drawSelectBox,
  drawConflictMaskOnMove,
  drawHoverIndicator,
} from "../core_stage/IndicatorStage.js";
import {
  detectOnMoveMask,
  detectOnHoverMachine,
  detectOnHoverBelt,
  detectOnHoverPipe,
} from "./ConflictDetect.js";
import { pixelToGridNoneOffset } from "./PositionConvert.js";

// === 状态 ===
export const S = {
  pipeOrBeltMode: true,
  isSelectMoving: false,
  nowPlaceIsBelt: true,

  placeIndicator: null,
  selectIndicator: null,
  hoverIndicator: null,

  indicatorGraphics: [],
  conflictGraphics: [],

  selectGraphics: { machines: {}, belts: {}, pipes: {} },
  metaBackup: { machines: {}, belts: {}, pipes: {} },
  metaRotateMove: { machines: {}, belts: {}, pipes: {} },

  base_grid_x: null,
  base_grid_y: null,
  now_grid_x: null,
  now_grid_y: null,
  base_pixel_x: null,
  base_pixel_y: null,
  now_pixel_x: null,
  now_pixel_y: null,

  queue: { mousedown: {}, mouseup: {}, mousemove: {} },
};

// === 可视化控制 ===

function initIndicator() {
  S.placeIndicator = drawMask({ gridX: 1, gridY: 1 });
  S.placeIndicator.visible = false;
  S.selectIndicator = drawSelectBox();
  S.selectIndicator.visible = false;
}

function placeIndicatorHandle(event) {
  S.placeIndicator.moveToGrid({ gridX: event.gridX, gridY: event.gridY });
  if (S.hoverIndicator) {
    S.hoverIndicator.destroy();
    S.hoverIndicator = null;
  }
  const machine = detectOnHoverMachine(event.gridX, event.gridY);
  const belt = detectOnHoverBelt(event.gridX, event.gridY);
  const pipe = detectOnHoverPipe(event.gridX, event.gridY);
  if (machine == null && belt == null && pipe == null) return;
  S.hoverIndicator = drawHoverIndicator(machine || belt || pipe);
}

function refreshIndicator() {
  if (S.indicatorGraphics.length === 0) return;
  S.indicatorGraphics.forEach((item) => item.destroy());
  S.indicatorGraphics = [];
}

function refreshSelectIndicator() {
  Object.values(S.selectGraphics).forEach((kind) => {
    Object.values(kind).forEach((item) => item.destroy());
  });
  S.selectGraphics = { machines: {}, belts: {}, pipes: {} };
  S.selectIndicator.visible = false;
}

function refreshConflictIndicator() {
  if (S.conflictGraphics.length === 0) return;
  S.conflictGraphics.forEach((item) => item.destroy());
  S.conflictGraphics = [];
}

function refreshIndicatorPosition() {
  S.base_grid_x = null;
  S.base_grid_y = null;
  S.now_grid_x = null;
  S.now_grid_y = null;
  S.base_pixel_x = null;
  S.base_pixel_y = null;
  S.now_pixel_x = null;
  S.now_pixel_y = null;
}

function refreshHandleQueue() {
  S.queue.mousedown = {};
  S.queue.mouseup = {};
  S.queue.mousemove = {};
}

function rebuildIfSelectMoving() {
  if (S.isSelectMoving) {
    Object.keys(S.metaBackup.machines).forEach((id) => {
      const m = S.metaBackup.machines[id];
      placeMachine(m, m.gridX, m.gridY);
    });
    Object.keys(S.metaBackup.belts).forEach((id) => {
      const b = S.metaBackup.belts[id];
      placeBelt(b, b.gridX, b.gridY, b.in, b.out);
    });
    Object.keys(S.metaBackup.pipes).forEach((id) => {
      const p = S.metaBackup.pipes[id];
      placePipe(p, p.gridX, p.gridY, p.in, p.out);
    });
    S.isSelectMoving = false;
  }
}

function moveMasksToOffset(last_delta_x, last_delta_y) {
  const storageStore = useStorageStore();
  const cellWidth = storageStore.cellWidth;
  const cellHeight = storageStore.cellHeight;
  const pixelDeltaX = S.now_pixel_x - S.base_pixel_x;
  const pixelDeltaY = S.now_pixel_y - S.base_pixel_y;
  const gridDeltaX = Math.round(pixelDeltaX / cellWidth);
  const gridDeltaY = Math.round(pixelDeltaY / cellHeight);
  if (
    last_delta_x != null &&
    Math.abs(gridDeltaX - last_delta_x) < 1 &&
    Math.abs(gridDeltaY - last_delta_y) < 1
  ) {
    return { gridDeltaX: last_delta_x, gridDeltaY: last_delta_y };
  }

  const moveKind = (kind, meta) => {
    Object.keys(S.selectGraphics[kind]).forEach((id) => {
      S.selectGraphics[kind][id].moveToGrid({
        gridX: meta[id].gridX + gridDeltaX,
        gridY: meta[id].gridY + gridDeltaY,
      });
    });
  };
  moveKind("machines", S.metaRotateMove.machines);
  moveKind("belts", S.metaRotateMove.belts);
  moveKind("pipes", S.metaRotateMove.pipes);
  generateConflictMask(
    detectOnMoveMask(S.metaRotateMove, gridDeltaX, gridDeltaY),
  );
  return { gridDeltaX, gridDeltaY };
}

function setSelectBaseCenterPixel(metaBackup, storageStore) {
  let max_x = -Infinity;
  let max_y = -Infinity;
  let min_x = Infinity;
  let min_y = Infinity;
  const cellHeight = storageStore.cellHeight;
  const cellWidth = storageStore.cellWidth;
  Object.values(metaBackup.machines).forEach((m) => {
    max_x = Math.max(max_x, m.centerX + cellWidth * m.gridWidth * 0.5);
    max_y = Math.max(max_y, m.centerY + cellHeight * m.gridHeight * 0.5);
    min_x = Math.min(min_x, m.centerX - cellWidth * m.gridWidth * 0.5);
    min_y = Math.min(min_y, m.centerY - cellHeight * m.gridHeight * 0.5);
  });
  Object.values(metaBackup.belts).forEach((b) => {
    max_x = Math.max(max_x, b.x + cellWidth * 0.5);
    max_y = Math.max(max_y, b.y + cellHeight * 0.5);
    min_x = Math.min(min_x, b.x - cellWidth * 0.5);
    min_y = Math.min(min_y, b.y - cellHeight * 0.5);
  });
  Object.values(metaBackup.pipes).forEach((p) => {
    max_x = Math.max(max_x, p.x + cellWidth * 0.5);
    max_y = Math.max(max_y, p.y + cellHeight * 0.5);
    min_x = Math.min(min_x, p.x - cellWidth * 0.5);
    min_y = Math.min(min_y, p.y - cellHeight * 0.5);
  });
  const { gridX, gridY } = pixelToGridNoneOffset(
    (max_x + min_x) / 2,
    (max_y + min_y) / 2,
  );
  console.log(gridX, gridY);
  S.base_pixel_x = gridX * cellWidth;
  S.base_pixel_y = gridY * cellHeight;
}

function generateConflictMask(metaConflict) {
  refreshConflictIndicator();
  S.conflictGraphics = drawConflictMaskOnMove(metaConflict);
}

export {
  initIndicator,
  placeIndicatorHandle,
  refreshIndicator,
  refreshSelectIndicator,
  refreshConflictIndicator,
  refreshIndicatorPosition,
  refreshHandleQueue,
  rebuildIfSelectMoving,
  moveMasksToOffset,
  setSelectBaseCenterPixel,
  generateConflictMask,
};
