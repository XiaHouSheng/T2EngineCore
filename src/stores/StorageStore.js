import { defineStore } from "pinia";
import { ref, computed, markRaw } from "vue";

export const useStorageStore = defineStore("StorageStore", () => {
  // 场景配置
  const width = ref(600);
  const height = ref(600);
  const scale = ref(1);
  const backgroundColor = ref(0xffffff);
  const rowCount = ref(10);
  const colCount = ref(10);
  const cellWidth = computed(() => width.value / colCount.value);
  const cellHeight = computed(() => height.value / rowCount.value);

  // 机器存储
  const machines = ref({}); // id -> meta
  const machineObjects = markRaw({}); // id -> object
  const machineLocations = ref(
    Array.from(
      {
        length: rowCount.value,
      },
      () =>
        Array.from({
          length: colCount.value,
        }).fill(null),
    ),
  ); // [x][y] -> id

  // 传送带存储
  const conveyors = ref({}); // id -> meta
  const conveyorObjects = markRaw({}); // id -> object
  const conveyorLocations = ref(
    Array.from(
      {
        length: rowCount.value,
      },
      () =>
        Array.from({
          length: colCount.value,
        }).fill(null),
    ),
  ); // [x][y] -> id

  // 管道存储
  const pipes = ref({}); // id -> meta
  const pipeObjects = markRaw({}); // id -> object
  const pipeLocations = ref(() => {
    return (arrays = Array.from(
      {
        length: rowCount.value,
      },
      () =>
        Array.from({
          length: colCount.value,
        }),
    ).fill(null));
  }); // [x][y] -> id

  return {
    width,
    height,
    cellWidth,
    cellHeight,
    scale,
    backgroundColor,
    rowCount,
    colCount,
    machines,
    machineObjects,
    machineLocations,
    conveyors,
    conveyorObjects,
    conveyorLocations,
    pipes,
    pipeObjects,
    pipeLocations,
  };
});
