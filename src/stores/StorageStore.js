import { defineStore } from "pinia";
import { ref, computed, markRaw } from "vue";

export const useStorageStore = defineStore("StorageStore", () => {
  // 场景配置
  const width = ref(800);
  const height = ref(800);
  const backgroundColor = ref(0xffffff);
  const rowCount = ref(50);
  const colCount = ref(50);
  const cellWidth = computed(() => width.value / colCount.value);
  const cellHeight = computed(() => height.value / rowCount.value);
  // 缩放比例以及偏移量
  const scale = ref(1);
  const min_scale = ref(0.8);
  const max_scale = ref(4);
  const offset_position = ref({ x: 0, y: 0 });
  const max_offset = ref(160);
  // 视图移动步长 = 单个格子的世界像素，随画布尺寸/行列数自动推导
  const base_step = Math.min(cellWidth.value, cellHeight.value) * 2;
  const default_pipe_port_offset = 0.125
  const default_belt_port_offset = 0.3175
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
  const pipeLocations = ref(
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

  return {
    width,
    height,
    cellWidth,
    cellHeight,
    scale,
    min_scale,
    max_scale,
    offset_position,
    max_offset,
    base_step,
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
    default_belt_port_offset,
    default_pipe_port_offset,
  };
});
