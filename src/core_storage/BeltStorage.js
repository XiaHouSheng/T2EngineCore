import { useStorageStore } from "../stores/StorageStore.js";

function saveBelt(belt, belt_container) {
  const storageStore = useStorageStore();
  belt.x = belt_container.position.x;
  belt.y = belt_container.position.y;
  storageStore.belts[belt.id] = belt;
  storageStore.beltObjects[belt.id] = belt_container;
  storageStore.beltLocations[belt.gridY - 1][belt.gridX - 1] =
    `${belt.id}.${belt.in}.${belt.out}`;
}

function dropBelt(belt) {
  const storageStore = useStorageStore();
  const belt_container = storageStore.beltObjects[belt.id];
  delete storageStore.belts[belt.id];
  delete storageStore.beltObjects[belt.id];
  storageStore.beltLocations[belt.gridY - 1][belt.gridX - 1] = null;
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
    if (
      upY < rowCount &&
      upX < colCount &&
      storageStore.beltLocations[upY][upX] !== null
    ) {
      temp_belt = storageStore.beltLocations[upY][upX];
      const [id, in_dir, out_dir] = temp_belt.split(".");
      if ((out_dir == belt.in || belt_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.belts[id]);
      }
    }
    if (
      downY < rowCount &&
      downX < colCount &&
      storageStore.beltLocations[downY][downX] !== null
    ) {
      temp_belt = storageStore.beltLocations[downY][downX];
      const [id, in_dir, out_dir] = temp_belt.split(".");
      if ((out_dir == belt.in || belt_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.belts[id]);
      }
    }
    if (
      leftY < rowCount &&
      leftX < colCount &&
      storageStore.beltLocations[leftY][leftX] !== null
    ) {
      temp_belt = storageStore.beltLocations[leftY][leftX];
      const [id, in_dir, out_dir] = temp_belt.split(".");
      if ((out_dir == belt.in || belt_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.belts[id]);
      }
    }
    if (
      rightY < rowCount &&
      rightX < colCount &&
      storageStore.beltLocations[rightY][rightX] !== null
    ) {
      temp_belt = storageStore.beltLocations[rightY][rightX];
      const [id, in_dir, out_dir] = temp_belt.split(".");
      if ((out_dir == belt.in || belt_.out == in_dir) && !visited.has(id)) {
        visited.add(id);
        queue.push(storageStore.belts[id]);
      }
    }
  }
  return belts;
}

function getBeltByPosition(grid_x, grid_y) {
  const storageStore = useStorageStore();
  const belt_id_in_out = storageStore.beltLocations?.[grid_y - 1]?.[grid_x - 1];
  if (belt_id_in_out == undefined) {
    return null;
  }
  return storageStore.belts[belt_id_in_out.split(".")[0]];
}

export { saveBelt, dropBelt, findBeltNearBy, getBeltByPosition };
