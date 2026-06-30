<script setup>
import { ref, onMounted, onUnmounted } from "vue";
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
import { handleKeyboard } from "../core_middleware/KeyboardHandle.js";

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
  window.addEventListener("keydown", handleKeyboard);
  const machine = createMachine("testType4");
  placeMachine(machine, 4, 4);
  placeBatchBelt({ startX: 7, startY: 7 }, { endX: 10, endY: 10 });
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
