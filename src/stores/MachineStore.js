import { defineStore } from "pinia";
import { markRaw } from "vue";

// 默认 fallback，当 machines.json 加载失败时使用
const DEFAULT_TYPES = {
  testType4: {
    gridWidth: 5,
    gridHeight: 4,
    anchor: [
      { x: 0.5, y: 0.375 },
      { x: 0.375, y: 0.5 },
    ],
    mask: [
      ["bi.down", "bi.down", "bi.down", "bi.down", "bi.down"],
      ["pi.right", "ma", "ma", "ma", "po.right"],
      ["ma", "ma", "ma", "ma", "ma"],
      ["bo.down", "bo.down", "bo.down", "bo.down", "bo.down"],
    ],
  },
};

export const useMachineStore = defineStore("machineStore", () => {
  const machineTypes = markRaw({ ...DEFAULT_TYPES });

  function setMachineTypes(types) {
    // 清除旧数据后注入新数据
    Object.keys(machineTypes).forEach((k) => delete machineTypes[k]);
    Object.assign(machineTypes, types);
  }

  return {
    machineTypes,
    setMachineTypes,
  };
});
