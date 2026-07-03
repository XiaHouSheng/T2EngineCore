<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { app } from "../core_stage/SimStage.js";
import { useStorageStore } from "../stores/StorageStore.js";
import { drawGridLines, drawHitArea } from "../core_stage/SimInit.js";
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
import { initIndicator } from "../core_sub/Indicator.js";
import {
  drawBatchMask,
  drawMaskFromPosition,
  drawSpecialMask,
} from "../core_stage/IndicatorStage.js";
import { handleKeyboard } from "../core_middleware/KeyboardHandle.js";
import {
  findBeltNearBy,
  getBeltByPosition,
} from "../core_storage/BeltStorage.js";
const storageStore = useStorageStore();
const canvas = ref(null);

(async () => {
  globalThis.__PIXI_APP__ = app;
  drawGridLines();
  drawHitArea();
  initIndicator();
  await app.init({
    width: storageStore.width,
    height: storageStore.height,
    backgroundColor: storageStore.backgroundColor,
  });
  canvas.value.appendChild(app.canvas);
})();

onMounted(() => {
  window.addEventListener("keydown", handleKeyboard);
  const machine = createMachine("testType4");
  placeMachine(machine, 4, 4);
  placeBatchBelt({ startX: 7, startY: 7 }, { endX: 10, endY: 10 });
  const choose_belt = getBeltByPosition(7, 8);
  const belts = findBeltNearBy(choose_belt);
  /*
  drawSpecialMask(
    {gridX: 4, gridY: 4},
    {gridWidth: machine.gridWidth, gridHeight: machine.gridHeight},
    machine.anchor[machine.rotation]
  )
  drawBatchMask(belts.map(belt => ({gridX: belt.gridX, gridY: belt.gridY})))
  console.log(drawMaskFromPosition({
    startX: 8,
    startY: 1,
  },{
    endX: 10,
    endY: 1,
  }, false))
  */
});

onUnmounted(() => {
  app.destroy();
  window.removeEventListener("keydown", handleKeyboard);
});
</script>

<template>
  <div ref="canvas"></div>
  <div>
    <button>Place Machine</button>
    <button>Place Belt</button>
    <button>Delete Belt</button>
    <button>Delete Machine</button>
  </div>
</template>

<style scoped></style>
