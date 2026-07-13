import { useStorageStore } from "../stores/StorageStore.js";
import {
  deleteMachine,
  placeMachine,
  rotateMachineByCenter,
} from "./Machine.js";
import {
  deleteBelt,
  placeBelt,
  rotateBeltByCenter,
  placeBatchBelt,
} from "./Belt.js";
import {
  deletePipe,
  placePipe,
  rotatePipeByCenter,
  placeBatchPipe,
} from "./Pipe.js";
import {
  drawMaskFromPosition,
  drawMaskSelectArea,
  drawMachineMask,
  drawBeltMask,
  drawPipeMask,
} from "../core_stage/IndicatorStage.js";
import {
  detectOnPlaceBatch,
} from "../core_middleware/ConflictDetect.js";
import { getMachineMaskTypeByPosition } from "../core_storage/MachineStorage.js";
import { useCommandStore, CMD_DEFAULT } from "../stores/KeyBoardStore.js";
import { scanAdjacentPort } from "../core_middleware/IndicatorUtil.js";
import { S, initIndicator, placeIndicatorHandle, refreshIndicator, refreshSelectIndicator, refreshConflictIndicator, refreshIndicatorPosition, refreshHandleQueue, rebuildIfSelectMoving, moveMasksToOffset, setSelectBaseCenterPixel, generateConflictMask } from "../core_middleware/IndicatorState.js";

function onStartPlace() {
  S.placeIndicator.visible = true;
  let start_direction = null;
  let final_direction = null;
  const onmousedown = (event) => {
    
    const maskType = getMachineMaskTypeByPosition(event.gridX, event.gridY);
    // 非第一次放置，检查是否有冲突对象
    if (S.conflictGraphics.length > 1 && final_direction != null) {
      return;
    }
    // 第一次放置，记录起点
    if (S.base_grid_x == null || S.base_grid_y == null) {
      // 点击在机器格上时，只允许端口格作为起点
      if (maskType != null) {
        if (S.nowPlaceIsBelt && maskType !== "bo") return;
        if (!S.nowPlaceIsBelt && maskType !== "po") return;
        const { offsetX, offsetY, dir } = scanAdjacentPort(
          event.gridX,
          event.gridY,
          false
        );
        if (dir == null) return;
        start_direction = dir;
        S.base_grid_x = event.gridX + offsetX;
        S.base_grid_y = event.gridY + offsetY;
        return;
      }
      S.base_grid_x = event.gridX;
      S.base_grid_y = event.gridY; 
      return;
    }

    //这里需要做判断，检查是否放置的是机器的入口或者cross/split等特殊node
    //先做机器port的判断
    let real_final_direction = null;
    let final_offsetX = 0;
    let final_offsetY = 0;
    if (maskType != null) {
      const { offsetX, offsetY, dir } = scanAdjacentPort(
        event.gridX,
        event.gridY,
        true,
      );
      if (dir == null) return;
      // 这里表示该点为机器传送带入口


      // 后续任务，对于以bi或者pi以及特殊node结尾的放置，直接cancel放置


      let belt_inner = S.nowPlaceIsBelt && maskType == "bi"
      let pipe_inner = !S.nowPlaceIsBelt && maskType == "pi"
      if (belt_inner || pipe_inner) {
        real_final_direction = dir;
        final_offsetX = offsetX;
        final_offsetY = offsetY;
      }
    }

    if (S.nowPlaceIsBelt) {
      console.log(S.base_grid_x, S.base_grid_y, S.now_grid_x + final_offsetX, S.now_grid_y + final_offsetY)
      //console.log(start_direction, real_final_direction, final_direction)
      final_direction = placeBatchBelt(
        { startX: S.base_grid_x, startY: S.base_grid_y },
        { endX: S.now_grid_x + final_offsetX, endY: S.now_grid_y + final_offsetY },
        start_direction || final_direction,
        real_final_direction,
        S.pipeOrBeltMode,
      );
    } else {
      final_direction = placeBatchPipe(
        { startX: S.base_grid_x, startY: S.base_grid_y },
        { endX: S.now_grid_x + final_offsetX, endY: S.now_grid_y + final_offsetY },
        start_direction || final_direction,
        real_final_direction,
        S.pipeOrBeltMode,
      );
    }
    if (start_direction != null) start_direction = null;
    S.base_grid_x = event.gridX;
    S.base_grid_y = event.gridY;


    const storageStore = useStorageStore();
    //console.log(storageStore.machineLocations);
    console.log(storageStore.conveyorLocations);
    console.log(storageStore.pipeLocations);

  };
  const onmousemove = (event) => {
    if (S.base_grid_x == null || S.base_grid_y == null) return;
    if (S.indicatorGraphics.length != 0) refreshIndicator();
    S.now_grid_x = event.gridX;
    S.now_grid_y = event.gridY;
    S.indicatorGraphics = drawMaskFromPosition(
      {
        startX: S.base_grid_x,
        startY: S.base_grid_y,
      },
      {
        endX: S.now_grid_x,
        endY: S.now_grid_y,
      },
      S.pipeOrBeltMode,
    );
    generateConflictMask(detectOnPlaceBatch(S.indicatorGraphics, S.nowPlaceIsBelt));
  };
  if (!S.queue.mousedown[arguments[0]]) {
    S.queue.mousedown[arguments[0]] = onmousedown;
  }
  if (!S.queue.mousemove[arguments[0]]) {
    S.queue.mousemove[arguments[0]] = onmousemove;
  }
}

function onStartPlaceBelt(name) {
  onCancel();
  S.placeIndicator.visible = true;
  S.nowPlaceIsBelt = true;
  onStartPlace();
}

function onStartPlacePipe(name) {
  onCancel();
  S.placeIndicator.visible = true;
  S.nowPlaceIsBelt = false;
  onStartPlace();
}

function onStartPlaceChangeMode() {
  refreshIndicator();
  S.pipeOrBeltMode = !S.pipeOrBeltMode;
  S.indicatorGraphics = drawMaskFromPosition(
    {
      startX: S.base_grid_x,
      startY: S.base_grid_y,
    },
    {
      endX: S.now_grid_x,
      endY: S.now_grid_y,
    },
    S.pipeOrBeltMode,
  );
  generateConflictMask(detectOnPlaceBatch(S.indicatorGraphics, S.nowPlaceIsBelt));
}

function onStartSelect(name) {
  onCancel();
  let start_select = false;
  let set = new Set();

  const storageStore = useStorageStore();

  const onmousedown = (event) => {
    S.base_pixel_x = event.client.x;
    S.base_pixel_y = event.client.y;
    S.selectIndicator.position.set(S.base_pixel_x, S.base_pixel_y);
    start_select = true;
  };
  const onmousemove = (event) => {
    if (!start_select) return;
    S.selectIndicator.visible = true;
    const width = event.client.x - S.base_pixel_x;
    const height = event.client.y - S.base_pixel_y;
    S.selectIndicator.drawSelectBox(width, height, S.base_pixel_x, S.base_pixel_y);
  };
  const onmouseup = (event) => {
    start_select = false;
    S.selectIndicator.visible = false;

    const { masks, keys } = drawMaskSelectArea(
      {
        startX: S.base_pixel_x,
        startY: S.base_pixel_y,
      },
      {
        endX: event.client.x,
        endY: event.client.y,
      },
      set,
    );
    Object.keys(masks).forEach((key) => {
      S.selectGraphics[key] = {
        ...S.selectGraphics[key],
        ...masks[key],
      };
    });

    // StorageStore 备份选中的 meta 数据
    S.metaBackup = { machines: {}, belts: {}, pipes: {} };
    S.metaRotateMove = { machines: {}, belts: {}, pipes: {} };
    Object.keys(S.selectGraphics.machines).forEach((id) => {
      S.metaBackup.machines[id] = { ...storageStore.machines[id] };
      S.metaRotateMove.machines[id] = { ...storageStore.machines[id] };
    });
    Object.keys(S.selectGraphics.belts).forEach((id) => {
      S.metaBackup.belts[id] = { ...storageStore.conveyors[id] };
      S.metaRotateMove.belts[id] = { ...storageStore.conveyors[id] };
    });
    Object.keys(S.selectGraphics.pipes).forEach((id) => {
      S.metaBackup.pipes[id] = { ...storageStore.pipes[id] };
      S.metaRotateMove.pipes[id] = { ...storageStore.pipes[id] };
    });
  };

  if (!S.queue.mousedown[name]) {
    S.queue.mousedown[name] = onmousedown;
  }
  if (!S.queue.mousemove[name]) {
    S.queue.mousemove[name] = onmousemove;
  }
  if (!S.queue.mouseup[name]) {
    S.queue.mouseup[name] = onmouseup;
  }
}

function onStartSelectMove(name, is_copy = false) {
  refreshHandleQueue();
  refreshIndicatorPosition();
  refreshConflictIndicator();

  const { machines, belts, pipes } = S.selectGraphics;
  if (
    Object.keys(machines).length == 0 &&
    Object.keys(belts).length == 0 &&
    Object.keys(pipes).length == 0
  ) {
    return;
  }

  S.isSelectMoving = true;

  const storageStore = useStorageStore();
  const cellWidth = storageStore.cellWidth;
  const cellHeight = storageStore.cellHeight;

  // 计算选中实体的中心 pixel 作为基准
  setSelectBaseCenterPixel(S.metaBackup, storageStore);
  // Step 2: 删除原始实体（清 storage + 拆 Container）
  // 如果是复制操作，不删除原始实体
  if (!is_copy) {
    Object.values(S.metaBackup.machines).forEach((m) => deleteMachine(m));
    Object.values(S.metaBackup.belts).forEach((b) => deleteBelt(b));
    Object.values(S.metaBackup.pipes).forEach((p) => deletePipe(p));
  }
  // Step 3: 鼠标事件 — mousemove 实时偏移，mousedown 确认放置
  let last_delta_x = 0,
    last_delta_y = 0;
  const onmousemove = (event) => {
    S.now_pixel_x = event.client.x;
    S.now_pixel_y = event.client.y;
    const { gridDeltaX, gridDeltaY } = moveMasksToOffset(
      last_delta_x,
      last_delta_y,
    );
    last_delta_x = gridDeltaX;
    last_delta_y = gridDeltaY;
  };

  const onmousedown = (event) => {
    const pixelDeltaX = event.client.x - S.base_pixel_x;
    const pixelDeltaY = event.client.y - S.base_pixel_y;
    const gridDeltaX = Math.round(pixelDeltaX / cellWidth);
    const gridDeltaY = Math.round(pixelDeltaY / cellHeight);
    // 检查是否冲突
    if (S.conflictGraphics.length > 0) {
      console.log("PLACE CONFLICT");
      return;
    }
    // Step 4: 放置到最终位置
    Object.keys(S.selectGraphics.machines).forEach((id) => {
      const m = S.metaRotateMove.machines[id];
      placeMachine(m, m.gridX + gridDeltaX, m.gridY + gridDeltaY, is_copy);
    });
    Object.keys(S.selectGraphics.belts).forEach((id) => {
      const b = S.metaRotateMove.belts[id];
      placeBelt(
        b,
        b.gridX + gridDeltaX,
        b.gridY + gridDeltaY,
        b.in,
        b.out,
        is_copy,
      );
    });
    Object.keys(S.selectGraphics.pipes).forEach((id) => {
      const p = S.metaRotateMove.pipes[id];
      placePipe(
        p,
        p.gridX + gridDeltaX,
        p.gridY + gridDeltaY,
        p.in,
        p.out,
        is_copy,
      );
    });
    S.isSelectMoving = false;
    onCancel();
  };
  S.queue.mousemove[name] = onmousemove;
  S.queue.mousedown[name] = onmousedown;
}

function onStartSelectRotate(name) {
  let set = new Set();
  // 清除所有的selectGraphics
  refreshSelectIndicator();
  // 基准点作为旋转中心点, 旋转选中实体
  Object.keys(S.metaRotateMove.machines).forEach((id) => {
    const machine = S.metaRotateMove.machines[id];
    S.metaRotateMove.machines[id] = rotateMachineByCenter(
      machine,
      S.base_pixel_x,
      S.base_pixel_y,
    );
  });
  Object.keys(S.metaRotateMove.belts).forEach((id) => {
    const belt = S.metaRotateMove.belts[id];
    S.metaRotateMove.belts[id] = rotateBeltByCenter(
      belt,
      S.base_pixel_x,
      S.base_pixel_y,
    );
  });
  Object.keys(S.metaRotateMove.pipes).forEach((id) => {
    const pipe = S.metaRotateMove.pipes[id];
    S.metaRotateMove.pipes[id] = rotatePipeByCenter(
      pipe,
      S.base_pixel_x,
      S.base_pixel_y,
    );
  });
  // 重新绘制选中实体的 mask
  S.selectGraphics.machines = drawMachineMask(S.metaRotateMove.machines, set);
  S.selectGraphics.belts = drawBeltMask(S.metaRotateMove.belts, set);
  S.selectGraphics.pipes = drawPipeMask(S.metaRotateMove.pipes, set);
  // 移动 mask 到新的位置
  moveMasksToOffset();
}

function onStartSelectCopy(name) {
  onStartSelectMove(name, true);
}

function onStartSelectDelete() {
  Object.values(S.metaBackup.machines).forEach((m) => deleteMachine(m));
  Object.values(S.metaBackup.belts).forEach((b) => deleteBelt(b));
  Object.values(S.metaBackup.pipes).forEach((p) => deletePipe(p));
  onCancel();
}

function onCancel() {
  refreshIndicator();
  refreshSelectIndicator();
  refreshConflictIndicator();
  refreshIndicatorPosition();
  refreshHandleQueue();
  rebuildIfSelectMoving();
  S.placeIndicator.visible = false;
  const commandStore = useCommandStore();
  commandStore.last_command = CMD_DEFAULT;
  commandStore.select_command = CMD_DEFAULT;
}

function onMouseMove(event) {
  placeIndicatorHandle(event);
  Object.values(S.queue.mousemove).forEach((item) => item(event));
}

function onMouseDown(event) {
  Object.values(S.queue.mousedown).forEach((item) => item(event));
}

function onMouseUp(event) {
  Object.values(S.queue.mouseup).forEach((item) => item(event));
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
  onStartSelectCopy,
};
export { onMouseMove, onMouseDown, onMouseUp };
export { initIndicator };
