<template>
  <div ref="container" class="sim-engine-canvas"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ensureEngine, destroyEngine } from "./engine.js";

/**
 * SimCanvas — 引擎画布挂载组件
 *
 * 用法：
 *   <SimCanvas :options="{ width: 800, height: 600 }" destroy-on-unmount />
 * 或通过 ref 获取引擎实例：
 *   const sim = ref(); sim.value.engine
 *
 * 注意：引擎为全局单例，多个 SimCanvas 实例共享同一个 Pixi 应用。
 * 默认组件卸载时不销毁引擎（destroy-on-unmount 可开启）。
 */
const props = defineProps({
  /** 引擎初始化选项 */
  options: { type: Object, default: () => ({}) },
  /** 组件卸载时是否销毁引擎 */
  destroyOnUnmount: { type: Boolean, default: false },
});

const emit = defineEmits(["ready", "error"]);

const container = ref(null);
const engine = ref(null);

onMounted(async () => {
  try {
    engine.value = await ensureEngine(props.options);
    container.value.appendChild(engine.value.canvas);
    emit("ready", engine.value);
  } catch (err) {
    emit("error", err);
  }
});

onUnmounted(async () => {
  if (props.destroyOnUnmount) {
    await destroyEngine();
  }
});

defineExpose({ engine });
</script>

<style scoped>
.sim-engine-canvas {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.sim-engine-canvas :deep(canvas) {
  display: block;
}
</style>
