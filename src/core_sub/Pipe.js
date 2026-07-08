import { nanoid } from "nanoid";
import { usePipeStore } from "../stores/PipeStore";
import { drawPipe, dropDrawPipe } from "../core_stage/PipeStage.js";
import { savePipe, dropPipe, findPipeNearBy } from "../core_storage/PipeStorage.js";
import { detectOnPlacePipe } from "../core_middleware/ConflictDetect.js";
import { pixelToGridNoneOffset } from "../core_middleware/PositionConvert.js";
/**
 * @param {
 *  id: string,
 *  gridX: number,
 *  gridY: number,
 *  type: split | merge | cross | default
 *  in : direction,
 *  out : direction,
 * } pipe
 */

function createPipe(typename) {
  const pipe = {
    id: nanoid(),
    type: typename,
  };
  return pipe;
}

function placePipe(pipe, x, y, in_dir, out_dir) {
  pipe.gridX = x;
  pipe.gridY = y;
  pipe.in = in_dir;
  pipe.out = out_dir;
  detectOnPlacePipe(pipe);
  savePipe(pipe, drawPipe(pipe));
}

function rotatePipe(pipe) {
  const pipeStore = usePipeStore();
  pipe.in = pipeStore.rotateMap[pipe.in];
  pipe.out = pipeStore.rotateMap[pipe.out];
  return pipe;
}

function rotatePipeByCenter(pipe, x, y) {
  // 计算旋转后的中心点坐标（顺时针 90°）
  const rotateX = x + y - pipe.y;
  const rotateY = y - x + pipe.x;
  pipe.x = rotateX;
  pipe.y = rotateY;
  // Mask旋转
  pipe = rotatePipe(pipe);
  // 重新计算网格坐标
  const { gridX, gridY } = pixelToGridNoneOffset(pipe.x, pipe.y);
  pipe.gridX = gridX;
  pipe.gridY = gridY;
  return pipe;
}

function deletePipe(pipe) {
  dropDrawPipe(dropPipe(pipe));
  return pipe;
}

function placeBatchPipe(start_position, end_position, change_mode = true) {
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
    placePipe(
      createPipe("default"),
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
  //place cross pipe
  placePipe(createPipe("default"), crossX, crossY, direction_in, direction_out);
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
    placePipe(
      createPipe("default"),
      next_x,
      next_y,
      direction_out,
      direction_out,
    );
  }
}

function deleteBatchPipe(pipe) {
    const pipes = findPipeNearBy(pipe);
    for (let i = 0; i < pipes.length; i++) {
        deletePipe(pipes[i]);
    }
    return pipes;
}

export { createPipe, placePipe, rotatePipe, rotatePipeByCenter, deletePipe, placeBatchPipe, deleteBatchPipe, };
