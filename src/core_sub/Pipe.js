import { nanoid } from "nanoid";
import { usePipeStore } from "../stores/PipeStore";
import { drawPipe, dropDrawPipe } from "../core_stage/PipeStage.js";
import {
  savePipe,
  dropPipe,
  findPipeNearBy,
  getPipeByPosition,
} from "../core_storage/PipeStorage.js";
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

function placePipe(pipe, x, y, in_dir, out_dir, is_copy = false) {
  // 如果是复制操作，生成新的 id
  if (is_copy) pipe.id = nanoid();

  // 交叉检测：当前位置已有直线 default 管且方向垂直，替换为 cross
  if (pipe.type === "default") {
    const existing = getPipeByPosition(x, y);
    if (existing && existing.type === "default" && existing.in === existing.out) {
      const vDirs = new Set(["up", "down"]);
      if (vDirs.has(in_dir) !== vDirs.has(existing.in)) {
        deletePipe(existing);
        placePipeNode(createPipe("cross"), x, y);
        return;
      }
    }
  }

  pipe.gridX = x;
  pipe.gridY = y;
  pipe.in = in_dir;
  pipe.out = out_dir;
  detectOnPlacePipe(pipe);
  savePipe(pipe, drawPipe(pipe));
}

function placePipeNode(pipe, x, y) {
  const pipeStore = usePipeStore();
  const in_dir = pipeStore.nodeDir[pipe.type].in;
  const out_dir = pipeStore.nodeDir[pipe.type].out;
  placePipe(pipe, x, y, in_dir, out_dir);
}

function rotatePipeNode(pipe) {
  const pipeStore = usePipeStore();
  let temp_in = [];
  let temp_out = [];
  for (let dir of pipe.in.split("|")) {
    temp_in.push(pipeStore.rotateMap[dir]);
  }
  for (let dir of pipe.out.split("|")) {
    temp_out.push(pipeStore.rotateMap[dir]);
  }
  pipe.in = temp_in.join("|");
  pipe.out = temp_out.join("|");
  return pipe;
}

function rotatePipe(pipe) {
  const pipeStore = usePipeStore();
  if (pipeStore.nodeTypes.has(pipe.type)) {
    pipe = rotatePipeNode(pipe);
    return pipe;
  }
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

function placeBatchPipe(
  start_position,
  end_position,
  start_pipe_dir_in = null,
  end_pipe_dir_out = null,
  change_mode = true,
  skip_first = false,
  skip_last = false,
) {
  const { startX, startY } = start_position;
  const { endX, endY } = end_position;
  if (startX === endX && startY === endY) {
    if (end_pipe_dir_out == null || start_pipe_dir_in == null) return;
    const pipe = getPipeByPosition(startX, startY);
    if (pipe) deletePipe(pipe);
    placePipe(
      createPipe("default"),
      startX,
      startY,
      start_pipe_dir_in,
      end_pipe_dir_out,
    );
    return end_pipe_dir_out;
  }
  if (startX === endX) {
    const delta_num = startY - endY;
    const direction_out = delta_num > 0 ? "up" : "down";
    const direction_in = direction_out;
    for (let i = 0; i < Math.abs(delta_num) + 1; i++) {
      let pre_i = delta_num > 0 ? -i : i;
      if (i == 0) {
        if (skip_first) continue;
        const pipe = getPipeByPosition(startX, startY);
        if (pipe) deletePipe(pipe);
        placePipe(
          createPipe("default"),
          startX,
          startY + pre_i,
          start_pipe_dir_in || direction_out,
          direction_out,
        );
        continue;
      }
      if (i == Math.abs(delta_num)) {
        if (skip_last) continue;
        placePipe(
          createPipe("default"),
          startX,
          startY + pre_i,
          direction_out,
          end_pipe_dir_out || direction_out,
        );
        continue;
      }
      placePipe(
        createPipe("default"),
        startX,
        startY + pre_i,
        direction_in,
        direction_out,
      );
    }
    return direction_out;
  }
  if (startY === endY) {
    const delta_num = startX - endX;
    const direction_out = delta_num > 0 ? "left" : "right";
    const direction_in = direction_out;
    for (let i = 0; i < Math.abs(delta_num) + 1; i++) {
      let pre_i = delta_num > 0 ? -i : i;
      if (i == 0) {
        if (skip_first) continue;
        const pipe = getPipeByPosition(startX, startY);
        if (pipe) deletePipe(pipe);
        placePipe(
          createPipe("default"),
          startX + pre_i,
          startY,
          start_pipe_dir_in || direction_out,
          direction_out,
        );
        continue;
      }
      if (i == Math.abs(delta_num)) {
        if (skip_last) continue;
        placePipe(
          createPipe("default"),
          startX + pre_i,
          startY,
          direction_out,
          end_pipe_dir_out || direction_out,
        );
        continue;
      }
      placePipe(
        createPipe("default"),
        startX + pre_i,
        startY,
        direction_in,
        direction_out,
      );
    }
    return direction_out;
  }

  const crossX = change_mode ? startX : endX;
  const crossY = change_mode ? endY : startY;
  //false -> endX, startY | startX, startY
  let delta_num, direction_in, direction_out;
  //start -> cross
  delta_num = change_mode ? startY - crossY : crossX - startX;
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
    if (i === 0 && skip_first) continue;
    if (i === 0 && start_pipe_dir_in) {
      const pipe = getPipeByPosition(startX, startY);
      if (pipe) deletePipe(pipe);
      placePipe(
        createPipe("default"),
        next_x,
        next_y,
        start_pipe_dir_in,
        direction_in,
      );
      continue;
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
    if (i === Math.abs(delta_num) && skip_last) continue;
    if (end_pipe_dir_out && i === Math.abs(delta_num)) {
      placePipe(
        createPipe("default"),
        next_x,
        next_y,
        direction_out,
        end_pipe_dir_out,
      );
      continue;
    }
    placePipe(
      createPipe("default"),
      next_x,
      next_y,
      direction_out,
      direction_out,
    );
  }
  return end_pipe_dir_out || direction_out;
}

function deleteBatchPipe(pipe) {
  const pipes = findPipeNearBy(pipe);
  for (let i = 0; i < pipes.length; i++) {
    deletePipe(pipes[i]);
  }
  return pipes;
}

export {
  createPipe,
  placePipe,
  placePipeNode,
  rotatePipe,
  rotatePipeNode,
  rotatePipeByCenter,
  deletePipe,
  placeBatchPipe,
  deleteBatchPipe,
};
