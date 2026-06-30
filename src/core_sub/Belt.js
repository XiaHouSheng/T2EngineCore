import { nanoid } from "nanoid";
import { useBeltStore } from "../stores/BeltStore";
import { drawBelt, dropDrawBelt } from "../core_stage/BeltStage.js";
import { saveBelt, dropBelt, findBeltNearBy } from "../core_storage/BeltStorage.js";
import { detectOnPlaceBelt } from "../core_middleware/ConflictDetect.js";
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

function deleteBelt(belt) {
  dropDrawBelt(dropBelt(belt));
  return belt;
}

function placeBatchBelt(start_position, end_position, change_mode = true) {
  const { startX, startY } = start_position;
  const { endX, endY } = end_position;
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

export { createBelt, placeBelt, rotateBelt, deleteBelt, placeBatchBelt, deleteBatchBelt };
