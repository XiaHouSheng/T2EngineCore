import {
  drawMask,
  drawSpecialMask,
  drawBatchMask,
  drawMaskFromPosition,
} from "../core_stage/IndicatorStage.js";

let placeIndicator = null;
let selectIndicator = null;
let pipeOrBeltMode = true;
let indicatorGraphics = [];
let base_grid_x = null,
  base_grid_y = null,
  now_grid_x = null,
  now_grid_y = null;

const queue = {
  mousedown: {},
  mouseup: {},
  mousemove: {},
};

function initPlaceIndicator() {
  placeIndicator = drawMask({ gridX: 1, gridY: 1 });
  placeIndicator.visible = false;
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

function refreshIndicatorPosition() {
  base_grid_x = null;
  base_grid_y = null;
  now_grid_x = null;
  now_grid_y = null;
}

function onStartPlaceBelt(name) {
  refreshIndicator();
  refreshIndicatorPosition();
  placeIndicator.visible = true;

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
  refreshIndicator();
  refreshIndicatorPosition();
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

function onStartSelect() {
  refreshIndicator();
  refreshIndicatorPosition();
  placeIndicator.visible = false;
}

function onStartSelectMove() {}

function onStartSelectRotate() {}

function onStartSelectDelete() {}

function onCancel() {
  refreshIndicator();
  refreshIndicatorPosition();
  placeIndicator.visible = false;

  queue.mousedown = {};
  queue.mouseup = {};
  queue.mousemove = {};
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
export { initPlaceIndicator };
