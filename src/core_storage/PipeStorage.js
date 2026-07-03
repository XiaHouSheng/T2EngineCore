import { useStorageStore } from "../stores/StorageStore.js";

function savePipe(pipe, pipe_container) {
  const storageStore = useStorageStore();
  storageStore.pipes[pipe.id] = pipe;
  storageStore.pipeObjects[pipe.id] = pipe_container;
  storageStore.pipeLocations[pipe.gridY - 1][pipe.gridX - 1] =
    `${pipe.id}.${pipe.in}.${pipe.out}`;
}

function dropPipe(pipe) {
  const storageStore = useStorageStore();
  const pipe_container = storageStore.pipeObjects[pipe.id];
  delete storageStore.pipes[pipe.id];
  delete storageStore.pipeObjects[pipe.id];
  storageStore.pipeLocations[pipe.gridY - 1][pipe.gridX - 1] = null;
  return pipe_container;
}

function findPipeNearBy(pipe) {
  const storageStore = useStorageStore();

  const rowCount = storageStore.rowCount;
  const colCount = storageStore.colCount;

  const visited = new Set();
  visited.add(pipe.id);
  const pipes = [];

  const queue = [pipe];
  while (queue.length > 0) {
    const pipe_ = queue.shift();
    pipes.push(pipe_);
    const upX = pipe_.gridX - 1;
    const upY = pipe_.gridY - 1 - 1;
    const downX = pipe_.gridX - 1;
    const downY = pipe_.gridY - 1 + 1;
    const leftX = pipe_.gridX - 1 - 1;
    const leftY = pipe_.gridY - 1;
    const rightX = pipe_.gridX - 1 + 1;
    const rightY = pipe_.gridY - 1;
    let temp_pipe;
    if (upY < rowCount && upX < colCount && storageStore.pipeLocations[upY][upX] !== null) {
      temp_pipe = storageStore.pipeLocations[upY][upX];
      const [id, in_dir, out_dir] = temp_pipe.split(".");
      if ((out_dir == pipe.in || pipe_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.pipes[id]);
      }
    }
    if (downY < rowCount && downX < colCount && storageStore.pipeLocations[downY][downX] !== null) {
      temp_pipe = storageStore.pipeLocations[downY][downX];
      const [id, in_dir, out_dir] = temp_pipe.split(".");
      if ((out_dir == pipe.in || pipe_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.pipes[id]);
      }
    }
    if (leftY < rowCount && leftX < colCount && storageStore.pipeLocations[leftY][leftX] !== null) {
      temp_pipe = storageStore.pipeLocations[leftY][leftX];
      const [id, in_dir, out_dir] = temp_pipe.split(".");
      if ((out_dir == pipe.in || pipe_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.pipes[id]);
      }
    }
    if (rightY < rowCount && rightX < colCount && storageStore.pipeLocations[rightY][rightX] !== null) {
      temp_pipe = storageStore.pipeLocations[rightY][rightX];
      const [id, in_dir, out_dir] = temp_pipe.split(".");
      if ((out_dir == pipe.in || pipe_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.pipes[id]);
      }
    }
  }
  return pipes;
}

function getPipeByPosition(grid_x, grid_y) {
  const storageStore = useStorageStore();
  const pipe_id_in_out = storageStore.pipeLocations?.[grid_y - 1]?.[grid_x - 1];
  if (pipe_id_in_out == undefined) {
    return null;
  }
  return storageStore.pipes[pipe_id_in_out.split(".")[0]];
}

export { savePipe, dropPipe, findPipeNearBy, getPipeByPosition };
