<script setup>
import { ref, onMounted } from "vue";
import { app } from "../core_stage/SimStage.js";
import { useStorageStore } from "../stores/StorageStore.js";
import { drawGridLines } from "../core_stage/GridStage.js";
import {
  placeMachine,
  createMachine,
  deleteMachine,
  rotateMachine,
} from "../core_sub/Machine.js";
import {
  placeBelt,
  placeBatchBelt,
  deleteBatchBelt,
  deleteBelt,
} from "../core_sub/Belt.js";
import {
  findBeltNearBy,
  getBeltByPosition,
} from "../core_middleware/BeltStorage.js";
import { getMachineByPosition } from "../core_middleware/MachineStorage.js";

const storageStore = useStorageStore();
const canvas = ref(null);

(async () => {
  globalThis.__PIXI_APP__ = app;
  drawGridLines();
  await app.init({
    width: storageStore.width,
    height: storageStore.height,
    backgroundColor: storageStore.backgroundColor,
  });
  canvas.value.appendChild(app.canvas);
})();

onMounted(() => {
  const machine = createMachine("testType4");
  let rotatedMachine = rotateMachine(machine);
  placeMachine(rotatedMachine, 4, 4);
  placeBatchBelt({ startX: 7, startY: 7 }, { endX: 10, endY: 10 });
  const belt_choose = getBeltByPosition(7, 8);
  const belts = deleteBatchBelt(belt_choose);
  console.log(belts);
  const machine_choose = getMachineByPosition(4, 4);
  console.log(machine_choose);
});
</script>

<template>
  <div ref="canvas"></div>
</template>

<style scoped></style>
