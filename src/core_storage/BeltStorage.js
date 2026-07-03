import { useStorageStore } from "../stores/StorageStore.js";

function saveBelt(belt, belt_container) {
  const storageStore = useStorageStore();
  storageStore.conveyors[belt.id] = belt;
  storageStore.conveyorObjects[belt.id] = belt_container;
  storageStore.conveyorLocations[belt.gridY - 1][belt.gridX - 1] =
    `${belt.id}.${belt.in}.${belt.out}`;
}

function dropBelt(belt) {
  const storageStore = useStorageStore();
  const belt_container = storageStore.conveyorObjects[belt.id];
  delete storageStore.conveyors[belt.id];
  delete storageStore.conveyorObjects[belt.id];
  storageStore.conveyorLocations[belt.gridY - 1][belt.gridX - 1] = null;
  return belt_container;
}

function findBeltNearBy(belt) {
  const storageStore = useStorageStore();

  const rowCount = storageStore.rowCount;
  const colCount = storageStore.colCount;

  const visited = new Set();
  visited.add(belt.id);
  const belts = [];

  const queue = [belt];
  while (queue.length > 0) {
    const belt_ = queue.shift();
    belts.push(belt_);
    const upX = belt_.gridX - 1;
    const upY = belt_.gridY - 1 - 1;
    const downX = belt_.gridX - 1;
    const downY = belt_.gridY - 1 + 1;
    const leftX = belt_.gridX - 1 - 1;
    const leftY = belt_.gridY - 1;
    const rightX = belt_.gridX - 1 + 1;
    const rightY = belt_.gridY - 1;
    let temp_belt;
    if (upY < rowCount && upX < colCount && storageStore.conveyorLocations[upY][upX] !== null) {
      temp_belt = storageStore.conveyorLocations[upY][upX];
      const [id, in_dir, out_dir] = temp_belt.split(".");
      if ((out_dir == belt.in || belt_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.conveyors[id]);
      }
    }
    if (downY < rowCount && downX < colCount && storageStore.conveyorLocations[downY][downX] !== null) {
      temp_belt = storageStore.conveyorLocations[downY][downX];
      const [id, in_dir, out_dir] = temp_belt.split(".");
      if ((out_dir == belt.in || belt_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.conveyors[id]);
      }
    }
    if (leftY < rowCount && leftX < colCount && storageStore.conveyorLocations[leftY][leftX] !== null) {
      temp_belt = storageStore.conveyorLocations[leftY][leftX];
      const [id, in_dir, out_dir] = temp_belt.split(".");
      if ((out_dir == belt.in || belt_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.conveyors[id]);
      }
    }
    if (rightY < rowCount && rightX < colCount && storageStore.conveyorLocations[rightY][rightX] !== null) {
      temp_belt = storageStore.conveyorLocations[rightY][rightX];
      const [id, in_dir, out_dir] = temp_belt.split(".");
      if ((out_dir == belt.in || belt_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.conveyors[id]);
      }
    }
  }
  return belts;
}

function getBeltByPosition(grid_x, grid_y) {
  const storageStore = useStorageStore();
  const belt_id_in_out = storageStore.conveyorLocations?.[grid_y - 1]?.[grid_x - 1];
  if (belt_id_in_out == undefined) {
    return null;
  }
  return storageStore.conveyors[belt_id_in_out.split(".")[0]];
}

export { saveBelt, dropBelt, findBeltNearBy, getBeltByPosition };
