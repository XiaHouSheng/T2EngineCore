import { useStorageStore } from "../stores/StorageStore.js";
import { useMachineStore } from "../stores/MachineStore.js";
import {
  createMachine,
  deleteMachine,
  placeMachine,
  rotateMachine,
  rotateMachineByCenter,
} from "./Machine.js";
import {
  deleteBelt,
  placeBelt,
  rotateBeltByCenter,
  createBeltNode,
  placeBatchBelt,
  placeBeltNode,
  rotateBeltNode,
} from "./Belt.js";
import {
  deletePipe,
  placePipe,
  rotatePipeByCenter,
  createPipeNode,
  placeBatchPipe,
  placePipeNode,
  rotatePipeNode,
} from "./Pipe.js";
import { handleDragEnd, handleDragStart, handleDragMove } from "./Drag.js";
import {
  detectOnPlaceBatch,
  detectOnPlaceFinalIsNode,
  detectOnPlaceMachine,
  detectOnPlaceNode,
  checkMachineBounds,
} from "../core_middleware/ConflictDetect.js";
import { useCommandStore, CMD_DEFAULT } from "../stores/KeyBoardStore.js";
import {
  scanAdjacentPort,
  directionConstraint,
} from "../core_middleware/IndicatorUtil.js";
import {
  S,
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
  setBaseGrid,
  setNowGrid,
  hasConflict,
  setPlaceIndicatorVisible,
  setPlaceIndicatorAlpha,
  setPlaceMode,
  togglePipeOrBeltMode,
  setSelectMoving,
  setPlacingMachineType,
  setNowPlaceNodeType,
  setPreMachine,
  setPreNode,
  generateConflictMask,
  drawMaskFromPosition,
  drawMaskSelectArea,
  drawMachineMask,
  drawBeltMask,
  drawPipeMask,
  drawSpecialMask,
  drawMask,
} from "../core_middleware/IndicatorState.js";
import {
  getLeftTopPosition,
  getMachineByPosition,
} from "../core_storage/MachineStorage.js";
import { pixelToGridNoneOffset } from "../core_middleware/PositionConvert.js";
import { getBeltByPosition } from "../core_storage/BeltStorage.js";
import { getPipeByPosition } from "../core_storage/PipeStorage.js";
import { getMachineMaskTypeByPosition } from "../core_storage/MachineStorage.js";

// 长按检测 — 一定时间内无松开则进入选中移动模式
let _longPressTimer = null;
function _cancelLongPress() {
  if (_longPressTimer !== null) {
    clearTimeout(_longPressTimer);
    _longPressTimer = null;
  }
}

function _startLongPress(gridX, gridY) {
  _cancelLongPress();
  const longPressDuration = 300; // ms
  if (S.isSelectMoving) return;
  _longPressTimer = setTimeout(() => {
    _longPressTimer = null;
    const machine = getMachineByPosition(gridX, gridY);
    if (!machine) return;

    S.metaBackup = { machines: {}, belts: {}, pipes: {} };
    S.metaRotateMove = { machines: {}, belts: {}, pipes: {} };
    S.selectGraphics = { machines: {}, belts: {}, pipes: {} };

    S.selectGraphics.machines[machine.id] = drawSpecialMask(
      { gridX: machine.gridX, gridY: machine.gridY },
      { gridWidth: machine.gridWidth, gridHeight: machine.gridHeight },
      machine.anchor[machine.rotation],
      false,
    );
    S.metaBackup.machines[machine.id] = { ...machine };
    S.metaRotateMove.machines[machine.id] = { ...machine };

    const commandStore = useCommandStore();
    commandStore.select_command = "SELECT";

    onStartSelectMove();
  }, longPressDuration);
}

function onStartPlace() {
  setPlaceIndicatorVisible(true);
  let start_direction = null;
  let final_direction = null;
  let skip_first = false;
  let skip_first_scan = false;

  function resetTempVariables() {
    start_direction = null;
    skip_first = false;
  }

  function handleFirstClick(event) {
    const beltType = getBeltByPosition(event.gridX, event.gridY)?.type;
    const pipeType = getPipeByPosition(event.gridX, event.gridY)?.type;
    const maskTypeRaw = getMachineMaskTypeByPosition(event.gridX, event.gridY);
    const maskType = maskTypeRaw ? maskTypeRaw.split(".")[0] : undefined;
    const maskDir = maskTypeRaw ? maskTypeRaw.split(".")[1] : undefined;
    const is_node =
      (S.nowPlaceIsBelt && beltType != null && beltType != "default") ||
      (!S.nowPlaceIsBelt && pipeType != null && pipeType != "default");
    if (is_node) {
      skip_first = true;
      skip_first_scan = true;
    }

    if (maskType != null) {
      if (S.nowPlaceIsBelt && maskType !== "bo") return false;
      if (!S.nowPlaceIsBelt && maskType !== "po") return false;
      const { offsetX, offsetY, dir } = scanAdjacentPort(
        event.gridX,
        event.gridY,
        false,
      );
      if (dir == null) return false;
      start_direction = dir;
      setBaseGrid(event.gridX + offsetX, event.gridY + offsetY);
      return true;
    }

    setBaseGrid(event.gridX, event.gridY);
    return true;
  }

  function validateEndClick(event) {
    if (hasConflict()) return null;
    skip_first_scan = true;

    const beltType = getBeltByPosition(event.gridX, event.gridY)?.type;
    const pipeType = getPipeByPosition(event.gridX, event.gridY)?.type;
    const maskTypeRaw = getMachineMaskTypeByPosition(event.gridX, event.gridY);
    const maskType = maskTypeRaw ? maskTypeRaw.split(".")[0] : undefined;

    const config = {
      skip_first,
      skip_last: false,
      end_is_port_or_node: false,
      real_final_direction: null,
      final_offsetX: 0,
      final_offsetY: 0,
    };

    // 只检查同种类型的 node
    const hasSameTypeNode = S.nowPlaceIsBelt
      ? beltType != null
      : pipeType != null;
    if (hasSameTypeNode) {
      if (
        !detectOnPlaceFinalIsNode(
          S.base_grid_x,
          S.base_grid_y,
          event.gridX,
          event.gridY,
          S.pipeOrBeltMode,
          S.nowPlaceIsBelt,
        )
      )
        return null;
      config.skip_last = true;
      config.end_is_port_or_node = true;
    }

    if (maskType != null) {
      const { offsetX, offsetY, dir } = scanAdjacentPort(
        event.gridX,
        event.gridY,
      );
      if (dir == null) return null;
      const belt_inner = S.nowPlaceIsBelt && maskType == "bi";
      const pipe_inner = !S.nowPlaceIsBelt && maskType == "pi";
      if (belt_inner || pipe_inner) {
        config.real_final_direction = dir;
        config.final_offsetX = offsetX;
        config.final_offsetY = offsetY;
        config.end_is_port_or_node = true;
      }
    }

    return config;
  }

  function executePlace(event, config) {
    if (S.nowPlaceIsBelt) {
      final_direction = placeBatchBelt(
        { startX: S.base_grid_x, startY: S.base_grid_y },
        {
          endX: S.now_grid_x + config.final_offsetX,
          endY: S.now_grid_y + config.final_offsetY,
        },
        start_direction || final_direction,
        config.real_final_direction,
        S.pipeOrBeltMode,
        config.skip_first,
        config.skip_last,
      );
    } else {
      final_direction = placeBatchPipe(
        { startX: S.base_grid_x, startY: S.base_grid_y },
        {
          endX: S.now_grid_x + config.final_offsetX,
          endY: S.now_grid_y + config.final_offsetY,
        },
        start_direction || final_direction,
        config.real_final_direction,
        S.pipeOrBeltMode,
        config.skip_first,
        config.skip_last,
      );
    }

    if (config.end_is_port_or_node) {
      onCancel();
      return;
    }

    resetTempVariables();
    setBaseGrid(event.gridX, event.gridY);
    console.log(useStorageStore().conveyorLocations);
    console.log(useStorageStore().pipeLocations);
    console.log(useStorageStore().machineLocations);
  }

  const onmousedown = (event) => {
    const storageStore = useStorageStore();
    if (S.base_grid_x == null || S.base_grid_y == null) {
      handleFirstClick(event);
      return;
    }
    if (S.now_grid_x < 1 || S.now_grid_x > storageStore.colCount) return;
    if (S.now_grid_y < 1 || S.now_grid_y > storageStore.rowCount) return;
    const config = validateEndClick(event);
    if (!config) return;
    executePlace(event, config);
  };

  const onmousemove = (event) => {
    if (S.base_grid_x == null || S.base_grid_y == null) return;
    if (S.indicatorGraphics.length != 0) refreshIndicator();
    const { process_grid_x, process_grid_y } = directionConstraint(
      event.gridX,
      event.gridY,
      S.base_grid_x,
      S.base_grid_y,
      S.pipeOrBeltMode,
    );
    setNowGrid(process_grid_x, process_grid_y);
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
      skip_first_scan,
    );
    generateConflictMask(
      detectOnPlaceBatch(
        S.indicatorGraphics,
        S.nowPlaceIsBelt,
        S.base_grid_x,
        S.base_grid_y,
        S.now_grid_x,
        S.now_grid_y,
        S.pipeOrBeltMode,
      ),
    );
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
  setPlaceIndicatorVisible(true);
  setPlaceMode(true);
  onStartPlace();
}

function onStartPlacePipe(name) {
  onCancel();
  setPlaceIndicatorVisible(true);
  setPlaceMode(false);
  onStartPlace();
}

function onStartPlaceNode(typeName, is_belt = true) {
  setNowPlaceNodeType(typeName);
  S.nowPlaceIsBelt = is_belt;

  // 预创建节点对象，用于预览和旋转
  if (is_belt) {
    S.pre_node = createBeltNode(typeName);
  } else {
    S.pre_node = createPipeNode(typeName);
  }

  const onmousemove = (event) => {
    refreshIndicator();
    refreshConflictIndicator();
    setNowGrid(event.gridX, event.gridY);

    const metaConflict = detectOnPlaceNode(event.gridX, event.gridY, is_belt);
    const entityConflict =
      Object.keys(metaConflict.machines).length > 0 ||
      Object.keys(metaConflict.belts).length > 0 ||
      Object.keys(metaConflict.pipes).length > 0;
    if (entityConflict) generateConflictMask(metaConflict);

    S.indicatorGraphics = [
      drawMask(
        { gridX: event.gridX, gridY: event.gridY },
        entityConflict,
        S.pre_node,
      ),
    ];
  };

  const onmousedown = (event) => {
    const storageStore = useStorageStore();
    const gx = event.gridX;
    const gy = event.gridY;

    if (gx < 1 || gx > storageStore.colCount) return;
    if (gy < 1 || gy > storageStore.rowCount) return;

    const metaConflict = detectOnPlaceNode(gx, gy, is_belt);
    const entityConflict =
      Object.keys(metaConflict.machines).length > 0 ||
      Object.keys(metaConflict.belts).length > 0 ||
      Object.keys(metaConflict.pipes).length > 0;
    if (entityConflict) return;
    if (S.nowPlaceIsBelt) {
      placeBeltNode(S.pre_node, gx, gy);
    } else {
      placePipeNode(S.pre_node, gx, gy);
    }

    onCancel();
  };

  S.queue.mousemove = {};
  S.queue.mousedown = {};
  S.queue.mousemove[typeName] = onmousemove;
  S.queue.mousedown[typeName] = onmousedown;
}

function onStartPlaceNodeRotate() {
  if (!S.pre_node) return;
  if (S.nowPlaceIsBelt) {
    setPreNode(rotateBeltNode(S.pre_node));
  } else {
    setPreNode(rotatePipeNode(S.pre_node));
  }
  const metaConflict = detectOnPlaceNode(
    S.now_grid_x,
    S.now_grid_y,
    S.nowPlaceIsBelt,
  );
  const entityConflict =
    Object.keys(metaConflict.machines).length > 0 ||
    Object.keys(metaConflict.belts).length > 0 ||
    Object.keys(metaConflict.pipes).length > 0;
  refreshIndicator();
  S.indicatorGraphics = [
    drawMask(
      { gridX: S.now_grid_x, gridY: S.now_grid_y },
      entityConflict,
      S.pre_node,
    ),
  ];
}

function onStartPlaceMachine(typeName) {
  const machineStore = useMachineStore();

  setPlaceIndicatorVisible(false);

  const type = machineStore.machineTypes[typeName];
  if (!type) return;
  const pre_machine = createMachine(typeName);
  setPlacingMachineType(typeName);
  setPreMachine(pre_machine);

  const onmousemove = (event) => {
    refreshIndicator();
    refreshConflictIndicator();
    const gx = event.gridX;
    const gy = event.gridY;
    const { conflict: boundsConflict } = checkMachineBounds(
      pre_machine,
      gx,
      gy,
    );
    setNowGrid(gx, gy);
    // 检测与已有实体的冲突并绘制冲突 mask
    const metaConflict = detectOnPlaceMachine(gx, gy, typeName, pre_machine);
    const entityConflict =
      Object.keys(metaConflict.machines).length > 0 ||
      Object.keys(metaConflict.belts).length > 0 ||
      Object.keys(metaConflict.pipes).length > 0;
    if (entityConflict) generateConflictMask(metaConflict);

    S.indicatorGraphics = [
      drawSpecialMask(
        { gridX: gx, gridY: gy },
        {
          gridWidth: pre_machine.gridWidth,
          gridHeight: pre_machine.gridHeight,
        },
        pre_machine.anchor[pre_machine.rotation],
        boundsConflict || entityConflict,
        S.pre_machine,
      ),
    ];
  };

  const onmousedown = (event) => {
    const gx = event.gridX;
    const gy = event.gridY;
    const { conflict: boundsConflict } = checkMachineBounds(
      pre_machine,
      gx,
      gy,
    );
    const metaConflict = detectOnPlaceMachine(gx, gy, typeName, pre_machine);
    const entityConflict =
      Object.keys(metaConflict.machines).length > 0 ||
      Object.keys(metaConflict.belts).length > 0 ||
      Object.keys(metaConflict.pipes).length > 0;

    if (boundsConflict || entityConflict) return;

    placeMachine(S.pre_machine, gx, gy);
    setBaseGrid(null, null);
    setNowGrid(null, null);
    onCancel();
  };

  S.queue.mousemove = {};
  S.queue.mousedown = {};
  S.queue.mousemove[typeName] = onmousemove;
  S.queue.mousedown[typeName] = onmousedown;
}

function onStartPlaceMachineRotate() {
  const pre = S.pre_machine;
  if (!pre || !S.placingMachineType) return;

  rotateMachine(pre);

  const gx = S.now_grid_x;
  const gy = S.now_grid_y;
  if (gx == null || gy == null) return;

  const { conflict: boundsConflict } = checkMachineBounds(pre, gx, gy);

  // 重新检测实体冲突
  const metaConflict = detectOnPlaceMachine(gx, gy, S.placingMachineType, pre);
  const entityConflict =
    Object.keys(metaConflict.machines).length > 0 ||
    Object.keys(metaConflict.belts).length > 0 ||
    Object.keys(metaConflict.pipes).length > 0;

  refreshIndicator();
  refreshConflictIndicator();
  if (entityConflict) generateConflictMask(metaConflict);
  setNowGrid(gx, gy);

  S.indicatorGraphics = [
    drawSpecialMask(
      { gridX: gx, gridY: gy },
      { gridWidth: pre.gridWidth, gridHeight: pre.gridHeight },
      pre.anchor[pre.rotation],
      boundsConflict || entityConflict,
      pre,
    ),
  ];
}

function onStartPlaceChangeMode() {
  refreshIndicator();
  togglePipeOrBeltMode();
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
  generateConflictMask(
    detectOnPlaceBatch(
      S.indicatorGraphics,
      S.nowPlaceIsBelt,
      S.base_grid_x,
      S.base_grid_y,
      S.now_grid_x,
      S.now_grid_y,
      S.pipeOrBeltMode,
    ),
  );
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
    S.selectIndicator.drawSelectBox(
      width,
      height,
      S.base_pixel_x,
      S.base_pixel_y,
    );
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

  setSelectMoving(true);

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
    if (hasConflict()) {
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
    setSelectMoving(false);
    onCancel();
  };
  S.queue.mousemove[name] = onmousemove;
  S.queue.mousedown[name] = onmousedown;
}

function onStartSelectRotate(name) {
  if (!S.isSelectMoving) return;
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
  setPlaceIndicatorVisible(false);
  S.placingMachineType = null;
  S.nowPlaceNodeType = null;
  S.pre_node = null;
  const commandStore = useCommandStore();
  commandStore.last_command = CMD_DEFAULT;
  commandStore.select_command = CMD_DEFAULT;
}

function onMouseMove(event) {
  _cancelLongPress();
  placeIndicatorHandle(event);
  if (!S.isSelectMoving) {
    handleDragMove(event);
  }
  Object.values(S.queue.mousemove).forEach((item) => item(event));
}

function onMouseDown(event) {
  handleDragStart(event);
  Object.values(S.queue.mousedown).forEach((item) => item(event));
  _startLongPress(event.gridX, event.gridY);
}

function onMouseUp(event) {
  _cancelLongPress();
  handleDragEnd(event);
  Object.values(S.queue.mouseup).forEach((item) => item(event));
}

function onMouseOut(event) {
  _cancelLongPress();
  setPlaceIndicatorAlpha(0);
  onMouseUp(event);
}

function onMouseOver(event) {
  setPlaceIndicatorAlpha(1);
}

export {
  onStartPlaceBelt,
  onStartPlacePipe,
  onStartPlaceMachine,
  onStartSelect,
  onCancel,
  onStartSelectMove,
  onStartSelectRotate,
  onStartSelectDelete,
  onStartPlaceChangeMode,
  onStartSelectCopy,
  onStartPlaceMachineRotate,
  onStartPlaceNode,
  onStartPlaceNodeRotate,
};
export { onMouseMove, onMouseDown, onMouseUp, onMouseOut, onMouseOver };
export { initIndicator };
