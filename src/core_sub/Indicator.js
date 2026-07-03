import { Graphics } from "pixi.js";
import { useStorageStore } from "../stores/StorageStore.js";
import { deleteMachine, placeMachine } from "./Machine.js";
import { deleteBelt, placeBelt } from "./Belt.js";
import { deletePipe, placePipe } from "./Pipe.js";
import {
  drawMask,
  drawSpecialMask,
  drawBatchMask,
  drawSelectBox,
  drawMaskFromPosition,
  drawMaskSelectArea,
} from "../core_stage/IndicatorStage.js";

let pipeOrBeltMode = true;
let isSelectMoving = false;

let placeIndicator = null;
let selectIndicator = null;
let indicatorGraphics = [];
let selectGraphics = {
  machines: {},
  belts: {},
  pipes: {},
};
let metaBackup = { machines: {}, belts: {}, pipes: {} };
let base_grid_x = null,
  base_grid_y = null,
  now_grid_x = null,
  now_grid_y = null;
let base_pixel_x = null,
  base_pixel_y = null,
  now_pixel_x = null,
  now_pixel_y = null;

const queue = {
  mousedown: {},
  mouseup: {},
  mousemove: {},
};

function initIndicator() {
  placeIndicator = drawMask({ gridX: 1, gridY: 1 });
  placeIndicator.visible = false;
  selectIndicator = drawSelectBox();
  selectIndicator.visible = false;
}

function placeIndicatorHandle(event) {
  placeIndicator.moveToGrid({ gridX: event.gridX, gridY: event.gridY });
}

function proxyForHandle(func, name) {
  return function () {
    func(name.toLowerCase());
    console.log(name);
  };
}

function refreshIndicator() {
  if (indicatorGraphics.length == 0) return;
  indicatorGraphics.forEach((item) => item.destroy());
  indicatorGraphics = [];
}

function refreshSelectIndicator() {
  Object.values(selectGraphics).forEach((kind) => {
    Object.values(kind).forEach((item) => item.destroy());
  });
  selectGraphics = {
    machines: {},
    belts: {},
    pipes: {},
  };
}

function refreshIndicatorPosition() {
  base_grid_x = null;
  base_grid_y = null;
  now_grid_x = null;
  now_grid_y = null;
  base_pixel_x = null;
  base_pixel_y = null;
  now_pixel_x = null;
  now_pixel_y = null;
}

function refreshHandleQueue() {
  queue.mousedown = {};
  queue.mouseup = {};
  queue.mousemove = {};
}

function rebuildIfSelectMoving() {
  if (isSelectMoving) {
    Object.keys(metaBackup.machines).forEach((id) => {
      const m = metaBackup.machines[id];
      placeMachine(m, m.gridX, m.gridY);
    });
    Object.keys(metaBackup.belts).forEach((id) => {
      const b = metaBackup.belts[id];
      placeBelt(b, b.gridX, b.gridY, b.in, b.out);
    });
    Object.keys(metaBackup.pipes).forEach((id) => {
      const p = metaBackup.pipes[id];
      placePipe(p, p.gridX, p.gridY, p.in, p.out);
    });
    isSelectMoving = false;
  }
}

function onStartPlaceBelt(name) {
  onCancel();

  const onmousedown = (event) => {
    base_grid_x = event.gridX;
    base_grid_y = event.gridY;
  };
  const onmousemove = (event) => {
    if (base_grid_x == null || base_grid_y == null) return;
    if (indicatorGraphics.length != 0) refreshIndicator();
    now_grid_x = event.gridX;
    now_grid_y = event.gridY;
    indicatorGraphics = drawMaskFromPosition(
      {
        startX: base_grid_x,
        startY: base_grid_y,
      },
      {
        endX: now_grid_x,
        endY: now_grid_y,
      },
      pipeOrBeltMode,
    );
  };
  if (!queue.mousedown[name]) {
    queue.mousedown[name] = onmousedown;
  }
  if (!queue.mousemove[name]) {
    queue.mousemove[name] = onmousemove;
  }
}

function onStartPlacePipe() {
  onCancel();
  placeIndicator.visible = true;
}

function onStartPlaceChangeMode() {
  refreshIndicator();
  pipeOrBeltMode = !pipeOrBeltMode;
  indicatorGraphics = drawMaskFromPosition(
    {
      startX: base_grid_x,
      startY: base_grid_y,
    },
    {
      endX: now_grid_x,
      endY: now_grid_y,
    },
    pipeOrBeltMode,
  );
}

function onStartSelect(name) {
  onCancel();
  let start_select = false;
  let set = new Set();

  const onmousedown = (event) => {
    base_pixel_x = event.client.x;
    base_pixel_y = event.client.y;
    selectIndicator.position.set(base_pixel_x, base_pixel_y);
    start_select = true;
  };
  const onmousemove = (event) => {
    if (!start_select) return;
    selectIndicator.visible = true;
    const width = event.client.x - base_pixel_x;
    const height = event.client.y - base_pixel_y;
    selectIndicator.drawSelectBox(width, height, base_pixel_x, base_pixel_y);
  };
  const onmouseup = (event) => {
    start_select = false;
    selectIndicator.visible = false;

    const { masks, keys } = drawMaskSelectArea(
      {
        startX: base_pixel_x,
        startY: base_pixel_y,
      },
      {
        endX: event.client.x,
        endY: event.client.y,
      },
      set,
    );
    Object.keys(masks).forEach((key) => {
      selectGraphics[key] = {
        ...selectGraphics[key],
        ...masks[key],
      };
    });
  };

  if (!queue.mousedown[name]) {
    queue.mousedown[name] = onmousedown;
  }
  if (!queue.mousemove[name]) {
    queue.mousemove[name] = onmousemove;
  }
  if (!queue.mouseup[name]) {
    queue.mouseup[name] = onmouseup;
  }
}

function onStartSelectMove(name) {
  refreshHandleQueue();
  refreshIndicatorPosition();
  isSelectMoving = true;
  metaBackup = { machines: {}, belts: {}, pipes: {} };

  const storageStore = useStorageStore();
  const cellWidth = storageStore.cellWidth;
  const cellHeight = storageStore.cellHeight;

  // Step 1: 从 StorageStore 备份选中的 meta 数据
  Object.keys(selectGraphics.machines).forEach((id) => {
    metaBackup.machines[id] = { ...storageStore.machines[id] };
  });
  Object.keys(selectGraphics.belts).forEach((id) => {
    metaBackup.belts[id] = { ...storageStore.conveyors[id] };
  });
  Object.keys(selectGraphics.pipes).forEach((id) => {
    metaBackup.pipes[id] = { ...storageStore.pipes[id] };
  });
  // 计算选中实体的中心 pixel 作为基准
  const allPositions = [];
  Object.values(metaBackup.machines).forEach((m) =>
    allPositions.push({ x: m.gridX, y: m.gridY }),
  );
  Object.values(metaBackup.belts).forEach((b) =>
    allPositions.push({ x: b.gridX, y: b.gridY }),
  );
  Object.values(metaBackup.pipes).forEach((p) =>
    allPositions.push({ x: p.gridX, y: p.gridY }),
  );

  if (allPositions.length === 0) {
    isSelectMoving = false;
    return;
  }

  const avgGX = allPositions.reduce((s, p) => s + p.x, 0) / allPositions.length;
  const avgGY = allPositions.reduce((s, p) => s + p.y, 0) / allPositions.length;
  base_pixel_x = avgGX * cellWidth;
  base_pixel_y = avgGY * cellHeight;

  // Step 2: 删除原始实体（清 storage + 拆 Container）
  Object.values(metaBackup.machines).forEach((m) => deleteMachine(m));
  Object.values(metaBackup.belts).forEach((b) => deleteBelt(b));
  Object.values(metaBackup.pipes).forEach((p) => deletePipe(p));

  // Step 3: 鼠标事件 — mousemove 实时偏移，mousedown 确认放置
  let lastGridDeltaX = 0;
  let lastGridDeltaY = 0;

  const moveMasksToOffset = (gridDeltaX, gridDeltaY) => {
    const moveKind = (kind, meta) => {
      Object.keys(selectGraphics[kind]).forEach((id) => {
        selectGraphics[kind][id].moveToGrid({
          gridX: meta[id].gridX + gridDeltaX,
          gridY: meta[id].gridY + gridDeltaY,
        });
      });
    };
    moveKind("machines", metaBackup.machines);
    moveKind("belts", metaBackup.belts);
    moveKind("pipes", metaBackup.pipes);
    lastGridDeltaX = gridDeltaX;
    lastGridDeltaY = gridDeltaY;
  };

  const onmousemove = (event) => {
    const pixelDeltaX = event.client.x - base_pixel_x;
    const pixelDeltaY = event.client.y - base_pixel_y;
    const gridDeltaX = Math.round(pixelDeltaX / cellWidth);
    const gridDeltaY = Math.round(pixelDeltaY / cellHeight);

    if (gridDeltaX === lastGridDeltaX && gridDeltaY === lastGridDeltaY) return;
    moveMasksToOffset(gridDeltaX, gridDeltaY);
  };

  const onmousedown = (event) => {
    const pixelDeltaX = event.client.x - base_pixel_x;
    const pixelDeltaY = event.client.y - base_pixel_y;
    const gridDeltaX = Math.round(pixelDeltaX / cellWidth);
    const gridDeltaY = Math.round(pixelDeltaY / cellHeight);

    // Step 4: 放置到最终位置
    Object.keys(metaBackup.machines).forEach((id) => {
      const m = metaBackup.machines[id];
      placeMachine(m, m.gridX + gridDeltaX, m.gridY + gridDeltaY);
    });
    Object.keys(metaBackup.belts).forEach((id) => {
      const b = metaBackup.belts[id];
      placeBelt(b, b.gridX + gridDeltaX, b.gridY + gridDeltaY, b.in, b.out);
    });
    Object.keys(metaBackup.pipes).forEach((id) => {
      const p = metaBackup.pipes[id];
      placePipe(p, p.gridX + gridDeltaX, p.gridY + gridDeltaY, p.in, p.out);
    });
    isSelectMoving = false;
    onCancel();
  };
  queue.mousemove[name] = onmousemove;
  queue.mousedown[name] = onmousedown;
}

function onStartSelectRotate() {}

function onStartSelectDelete() {}

function onCancel() {
  refreshIndicator();
  refreshSelectIndicator();
  refreshIndicatorPosition();
  refreshHandleQueue();
  rebuildIfSelectMoving();
  placeIndicator.visible = false;
}

function onMouseMove(event) {
  placeIndicatorHandle(event);
  Object.values(queue.mousemove).forEach((item) => item(event));
}

function onMouseDown(event) {
  Object.values(queue.mousedown).forEach((item) => item(event));
}

function onMouseUp(event) {
  Object.values(queue.mouseup).forEach((item) => item(event));
}

export {
  onStartPlaceBelt,
  onStartPlacePipe,
  onStartSelect,
  onCancel,
  onStartSelectMove,
  onStartSelectRotate,
  onStartSelectDelete,
  onStartPlaceChangeMode,
};
export { onMouseMove, onMouseDown, onMouseUp };
export { proxyForHandle };
export { initIndicator };
