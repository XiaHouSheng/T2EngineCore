import { defineStore } from "pinia";
import { markRaw, ref } from "vue";

export const useMachineStore = defineStore("machineStore", () => {
  const machineTypes = markRaw({
    testType4: {
      gridWidth: 5,
      gridHeight: 4,
      anchor: [
        {
          x: 0.5,
          y: 0.375,
        },
        {
          x: 0.375,
          y: 0.5,
        },
      ],
      mask: [
        ["bi.down", "bi.down", "bi.down", "bi.up", "bi.down"],
        ["pi.right", "ma", "ma", "ma", "po.right"],
        ["ma", "ma", "ma", "ma", "ma"],
        ["bo.down", "bo.down", "bo.down", "bo.down", "bo.down"],
      ],
    },
  })

  return {
    machineTypes,
  };
});
