import { useStorageStore } from "../stores/StorageStore.js";
import { placeMachine, deleteMachine } from "../core_sub/Machine.js";
import { placeBelt, deleteBelt } from "../core_sub/Belt.js";
import { placePipe, deletePipe } from "../core_sub/Pipe.js";

export function renderBlueprint(blueprint) {
  if (!blueprint || !blueprint.content) return;
  const { machines = {}, belts = {}, pipes = {} } = blueprint.content;
  // 浅拷贝实体后再放置：placeXxx 会写入 gridX/gridY/x/y/centerX/centerY 等字段，
  // 直接传引用会污染蓝图保存的内容
  Object.values(machines).forEach((machine) => {
    placeMachine({ ...machine }, machine.gridX, machine.gridY);
  });
  Object.values(belts).forEach((belt) => {
    placeBelt({ ...belt }, belt.gridX, belt.gridY, belt.in, belt.out);
  });
  Object.values(pipes).forEach((pipe) => {
    placePipe({ ...pipe }, pipe.gridX, pipe.gridY, pipe.in, pipe.out);
  });
}

export function clearBlueprint() {
  const storageStore = useStorageStore();
  Object.values(storageStore.machines).forEach((machine) => {
    deleteMachine(machine);
  });
  Object.values(storageStore.belts).forEach((belt) => {
    deleteBelt(belt);
  });
  Object.values(storageStore.pipes).forEach((pipe) => {
    deletePipe(pipe);
  });
}
