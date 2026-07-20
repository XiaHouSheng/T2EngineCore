import { indicatorContainer } from "./SimStage";
import { IndicatorGraphic } from "../core_graphic/IndicatorGraphic.js";
import { SelectGraphic } from "../core_graphic/SelectGraphic.js";
import { HoverGraphic } from "../core_graphic/hoverGraphic.js";
import { scanGridByPixel } from "../core_middleware/GridRegistry.js";

//一个Cube的遮罩指示
function drawMask(position, conflict = false) {
  const mask = new IndicatorGraphic(position, undefined, undefined, conflict);
  indicatorContainer.addChild(mask);
  return mask;
}

//指定长宽的遮罩指示
function  drawSpecialMask(position, size, pivot, is_conflict = false) {
  const mask = new IndicatorGraphic(position, size, pivot, is_conflict);
  indicatorContainer.addChild(mask);
  return mask;
}

//批量cube的遮罩指示
function drawBatchMask(positions) {
  const masks = [];
  positions.forEach((position) => {
    const mask = drawMask(position);
    masks.push(mask);
  });
  return masks;
}

//从位置到位置的遮罩指示
function drawMaskFromPosition(
  start_position,
  end_position,
  change_mode = true,
  skip_first = false,
) {
  const { startX, startY } = start_position;
  const { endX, endY } = end_position;
  const masks = [];

  if (startX === endX && startY === endY) {
    return masks;
  }

  if (startX === endX) {
    const delta_num = startY - endY;
    for (let i = 0; i < Math.abs(delta_num) + 1; i++) {
      if (skip_first && i === 0) continue;
      let pre_i = delta_num > 0 ? -i : i;
      const mask = drawMask({ gridX: startX, gridY: startY + pre_i });
      masks.push(mask);
    }
    return masks;
  }

  if (startY === endY) {
    const delta_num = startX - endX;
    for (let i = 0; i < Math.abs(delta_num) + 1; i++) {
      if (skip_first && i === 0) continue;
      let pre_i = delta_num > 0 ? -i : i;
      const mask = drawMask({ gridX: startX + pre_i, gridY: startY });
      masks.push(mask);
    }
    return masks;
  }

  const crossX = change_mode ? startX : endX;
  const crossY = change_mode ? endY : startY;

  let delta_num;
  //start -> cross
  delta_num = change_mode ? startY - crossY : startX - crossX;
  //place start -> cross
  for (let i = 0; i < Math.abs(delta_num); i++) {
    if (skip_first && i === 0) continue;
    let next_x, next_y;
    if (change_mode) {
      next_x = startX;
      next_y = delta_num > 0 ? startY - i : startY + i;
    } else {
      next_x = delta_num > 0 ? startX - i : startX + i;
      next_y = startY;
    }
    const mask = drawMask({ gridX: next_x, gridY: next_y });
    masks.push(mask);
  }
  //cross -> end
  delta_num = change_mode ? crossX - endX : crossY - endY;
  //place cross mask
  masks.push(drawMask({ gridX: crossX, gridY: crossY }));
  //place cross -> end
  for (let i = 1; i < Math.abs(delta_num) + 1; i++) {
    let next_x, next_y;
    if (change_mode) {
      next_x = delta_num > 0 ? crossX - i : crossX + i;
      next_y = crossY;
    } else {
      next_x = crossX;
      next_y = delta_num > 0 ? crossY - i : crossY + i;
    }
    const mask = drawMask({ gridX: next_x, gridY: next_y });
    masks.push(mask);
  }
  return masks;
}

//画框选框
function drawSelectBox() {
  const selectBox = new SelectGraphic();
  indicatorContainer.addChild(selectBox);
  return selectBox;
}

//画机器的mask
function drawMachineMask(machines, now_keys, is_conflict = false) {
  const masks = {};
  Object.keys(machines).forEach((key) => {
    if (now_keys.has(key)) return;
    const machine = machines[key];
    const mask = drawSpecialMask(
      { gridX: machine.gridX, gridY: machine.gridY },
      { gridWidth: machine.gridWidth, gridHeight: machine.gridHeight },
      machine.anchor[machine.rotation],
      is_conflict,
    );
    now_keys.add(key);
    masks[key] = mask;
  });
  return masks;
}

//画带的mask
function drawBeltMask(belts, now_keys, is_conflict = false) {
  const masks = {};
  Object.keys(belts).forEach((key) => {
    if (now_keys.has(key)) return;
    const belt = belts[key];
    console.log()
    const mask = drawMask(
      { gridX: belt.gridX, gridY: belt.gridY },
      is_conflict,
    );
    now_keys.add(key);
    masks[key] = mask;
  });
  return masks;
}

//画管道的mask
function drawPipeMask(pipes, now_keys, is_conflict = false) {
  const masks = {};
  Object.keys(pipes).forEach((key) => {
    if (now_keys.has(key)) return;
    const pipe = pipes[key];
    const mask = drawMask(
      { gridX: pipe.gridX, gridY: pipe.gridY },
      is_conflict,
    );
    now_keys.add(key);
    masks[key] = mask;
  });
  return masks;
}

//画框选后的mask
function drawMaskSelectArea(start_position, end_position, now_keys) {
  const { machines, belts, pipes } = scanGridByPixel(
    start_position,
    end_position,
  );
  let masks = {
    machines: {},
    belts: {},
    pipes: {},
  };
  masks.machines = drawMachineMask(machines, now_keys);
  masks.belts = drawBeltMask(belts, now_keys);
  masks.pipes = drawPipeMask(pipes, now_keys);
  return {
    masks,
    now_keys,
  };
}

//画冲突mask
function drawConflictMaskOnMove(metaConflict) {
  let now_keys = new Set();
  let conflictGraphics = [];
  const machine_masks = drawMachineMask(metaConflict.machines, now_keys, true);
  const belt_masks = drawBeltMask(metaConflict.belts, now_keys, true);
  const pipe_masks = drawPipeMask(metaConflict.pipes, now_keys, true);
  conflictGraphics = conflictGraphics.concat(
    Object.values(machine_masks),
    Object.values(belt_masks),
    Object.values(pipe_masks),
  )
  return conflictGraphics;
}

// 画机器的port指示器
function drawHoverIndicator(entity) {
  const indicator = new HoverGraphic(
    { gridX: entity.gridX, gridY: entity.gridY },
    { gridWidth: entity.gridWidth || 1, gridHeight: entity.gridHeight || 1 },
    entity.anchor?.[entity.rotation] || { x: 0.5, y: 0.5 },
  );
  indicatorContainer.addChild(indicator);
  return indicator;
}

export {
  drawMask,
  drawSelectBox,
  drawSpecialMask,
  drawBatchMask,
  drawPipeMask,
  drawBeltMask,
  drawMachineMask,
  drawMaskFromPosition,
  drawMaskSelectArea,
  drawConflictMaskOnMove,
  drawHoverIndicator,
};
