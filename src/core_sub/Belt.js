import { nanoid } from "nanoid";
import { useBeltStore } from "../stores/BeltStore";
import { drawBelt, dropDrawBelt } from "../core_stage/BeltStage.js";
import {
  saveBelt,
  dropBelt,
  findBeltNearBy,
} from "../core_storage/BeltStorage.js";
import { detectOnPlaceBelt } from "../core_middleware/ConflictDetect.js";
import { pixelToGridNoneOffset } from "../core_middleware/PositionConvert.js";
/**
 * @param {
 *  id: string,
 *  gridX: number,
 *  gridY: number,
 *  type: split | merge | cross | default
 *  in : direction,
 *  out : direction,
 * } belt
 */

function createBelt(typename) {
  const belt = {
    id: nanoid(),
    type: typename,
  };
  return belt;
}

function placeBelt(belt, x, y, in_dir, out_dir) {
  belt.gridX = x;
  belt.gridY = y;
  belt.in = in_dir;
  belt.out = out_dir;
  detectOnPlaceBelt(belt);
  saveBelt(belt, drawBelt(belt));
}

function rotateBelt(belt) {
  const beltStore = useBeltStore();
  belt.in = beltStore.rotateMap[belt.in];
  belt.out = beltStore.rotateMap[belt.out];
  return belt;
}

function rotateBeltByCenter(belt, x, y) {
  // 计算旋转后的中心点坐标（顺时针 90°）
  const rotateX = x + y - belt.y;
  const rotateY = y - x + belt.x;
  belt.x = rotateX;
  belt.y = rotateY;
  // Mask旋转
  belt = rotateBelt(belt);
  // 重新计算网格坐标
  const { gridX, gridY } = pixelToGridNoneOffset(belt.x, belt.y);
  belt.gridX = gridX;
  belt.gridY = gridY;
  return belt;
}

function deleteBelt(belt) {
  dropDrawBelt(dropBelt(belt));
  return belt;
}

function placeBatchBelt(
  start_position,
  end_position,
  start_belt_dir_in = null,
  change_mode = true,
) {
  const { startX, startY } = start_position;
  const { endX, endY } = end_position;

  if (startX === endX && startY === endY) {
    return;
  }
  if (startX === endX) {
    const delta_num = startY - endY;
    const direction_out = delta_num > 0 ? "up" : "down";
    const direction_in = start_belt_dir_in || direction_out;
    for (let i = 0; i < Math.abs(delta_num) + 1; i++) {
      let pre_i = delta_num > 0 ? -i : i;
      placeBelt(
        createBelt("default"),
        startX,
        startY + pre_i,
        direction_in,
        direction_out,
      );
    }
    return;
  }
  if (startY === endY) {
    const delta_num = startX - endX;
    const direction_out = delta_num > 0 ? "left" : "right";
    const direction_in = start_belt_dir_in || direction_out;
    for (let i = 0; i < Math.abs(delta_num) + 1; i++) {
      let pre_i = delta_num > 0 ? -i : i;
      placeBelt(
        createBelt("default"),
        startX + pre_i,
        startY,
        direction_in,
        direction_out,
      );
    }
    return;
  }

  const crossX = change_mode ? startX : endX;
  const crossY = change_mode ? endY : startY;
  let delta_num, direction_in, direction_out;
  //start -> cross
  delta_num = change_mode ? startY - crossY : startX - crossX;
  direction_in = change_mode
    ? delta_num > 0
      ? "up"
      : "down"
    : delta_num > 0
      ? "right"
      : "left";
  //place start -> cross
  for (let i = 0; i < Math.abs(delta_num); i++) {
    let next_x, next_y;
    switch (direction_in) {
      case "up":
        next_x = startX;
        next_y = startY - i;
        break;
      case "down":
        next_x = startX;
        next_y = startY + i;
        break;
      case "right":
        next_x = startX + i;
        next_y = startY;
        break;
      case "left":
        next_x = startX - i;
        next_y = startY;
        break;
    }
    if (i === 0 && start_belt_dir_in) {
      direction_in = start_belt_dir_in;
    }
    placeBelt(
      createBelt("default"),
      next_x,
      next_y,
      direction_in,
      direction_in,
    );
  }
  //cross -> end
  delta_num = change_mode ? crossX - endX : crossY - endY;
  direction_out = change_mode
    ? delta_num > 0
      ? "left"
      : "right"
    : delta_num > 0
      ? "up"
      : "down";
  //place cross belt
  placeBelt(createBelt("default"), crossX, crossY, direction_in, direction_out);
  //place cross -> end
  for (let i = 1; i < Math.abs(delta_num) + 1; i++) {
    let next_x, next_y;
    switch (direction_out) {
      case "up":
        next_x = crossX;
        next_y = crossY - i;
        break;
      case "down":
        next_x = crossX;
        next_y = crossY + i;
        break;
      case "right":
        next_x = crossX + i;
        next_y = crossY;
        break;
      case "left":
        next_x = crossX - i;
        next_y = crossY;
        break;
    }
    placeBelt(
      createBelt("default"),
      next_x,
      next_y,
      direction_out,
      direction_out,
    );
  }
}

function deleteBatchBelt(belt) {
  const belts = findBeltNearBy(belt);
  for (let i = 0; i < belts.length; i++) {
    deleteBelt(belts[i]);
  }
  return belts;
}

export {
  createBelt,
  placeBelt,
  rotateBelt,
  rotateBeltByCenter,
  deleteBelt,
  placeBatchBelt,
  deleteBatchBelt,
};
