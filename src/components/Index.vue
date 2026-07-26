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
  createBelt,
  placeBeltNode,
  rotateBelt,
  placeBatchBelt,
  deleteBatchBelt,
  deleteBelt,
} from "../core_sub/Belt.js";
import {
  placePipe,
  createPipe,
  placePipeNode,
  rotatePipe,
  placeBatchPipe,
  deleteBatchPipe,
} from "../core_sub/Pipe.js";

import { initIndicator } from "../core_sub/Indicator.js";
import { dispatchPlaceMachineHandle } from "../core_middleware/KeyboardHandle.js";
import { S } from "../core_middleware/IndicatorState.js";
import {
  drawBatchMask,
  drawMaskFromPosition,
  drawSpecialMask,
} from "../core_stage/IndicatorStage.js";
import { handleKeyboard, handleKeyboardForZoom } from "../core_middleware/KeyboardHandle.js";
import {
  findBeltNearBy,
  getBeltByPosition,
} from "../core_storage/BeltStorage.js";
import { getMachineMaskTypeByPosition } from "../core_storage/MachineStorage.js";
import { initLoader } from "../core_loader/index.js";
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
  window.addEventListener("keydown", handleKeyboardForZoom);
  const machine = createMachine("testType4");
  const rotate_machine = rotateMachine(machine);
  placeMachine(rotate_machine, 4, 4);
  const pipe = createPipe("merge");
  placePipeNode(pipe, 7, 8);
});

onUnmounted(() => {
  app.destroy();
  window.removeEventListener("keydown", handleKeyboard);
  window.removeEventListener("keydown", handleKeyboardForZoom);
});
</script>

<template>
  <div ref="canvas"></div>
  <div>
    <button
      :style="{ background: S.placingMachineType === 'testType4' ? '#446' : '' }"
      @click="dispatchPlaceMachineHandle('testType4', 'place_machine')"
    >Place Machine</button>
    <button>Place Belt</button>
    <button>Delete Belt</button>
    <button>Delete Machine</button>
  </div>
</template>

<style scoped></style>
