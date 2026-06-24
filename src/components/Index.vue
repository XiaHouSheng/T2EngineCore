<script setup>
import { ref, onMounted } from "vue";
import { app } from "../core_stage/SimStage.js";
import { useStageStore } from "../stores/StageConfig.js";
import { drawGridLines } from "../core_stage/GridStage.js";
import { placeMachine, createMachine } from "../core_sub/Machine.js";

const stageStore = useStageStore();
const canvas = ref(null);

(async () => {
  globalThis.__PIXI_APP__ = app;
  drawGridLines();
  await app.init({
    width: stageStore.width,
    height: stageStore.height,
    backgroundColor: stageStore.backgroundColor,
  });
  canvas.value.appendChild(app.canvas);
})();

onMounted(() => {
  const machine = createMachine("testType");
  placeMachine(machine, 1, 1);
  console.log(machine);

});


</script>

<template>
  <div ref="canvas"></div>
</template>

<style scoped></style>
