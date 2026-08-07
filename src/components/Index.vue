<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { app } from "../core_stage/SimStage.js";
import { useStorageStore } from "../stores/StorageStore.js";
import { useResourcesStore } from "../stores/ResourcesStore.js";
import { useMachineStore } from "../stores/MachineStore.js";
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
import { dispatchPlaceMachineHandle, dispatchPlaceNodeHandle } from "../core_middleware/KeyboardHandle.js";
import { S } from "../core_middleware/IndicatorState.js";
import { setMachineClickHandler } from "../core_middleware/EventHandle.js";
import {
  setNowRecipe,
  getMachineObject,
} from "../core_middleware/MachineUtil.js";
import {
  drawBatchMask,
  drawMaskFromPosition,
  drawSpecialMask,
} from "../core_stage/IndicatorStage.js";
import { handleKeyboard, handleKeyboardUp,  handleKeyboardForZoom } from "../core_middleware/KeyboardHandle.js";
import {
  findBeltNearBy,
  getBeltByPosition,
} from "../core_storage/BeltStorage.js";
import { getMachineMaskTypeByPosition } from "../core_storage/MachineStorage.js";
import { initLoader } from "../core_loader/index.js";
import { resetPosition, resetScale } from "../core_stage/ScaleStage.js";
const storageStore = useStorageStore();
const machineStore = useMachineStore();
const canvas = ref(null);

// 机器类型选择器状态
const showMachineSelector = ref(false);
const selectedMachineType = ref(null);
const machineTypeList = computed(() => Object.keys(machineStore.machineTypes));

// 配方选择器状态
const showRecipeSelector = ref(false);
const recipeSelectorMachine = ref(null);
const recipeSelectorOptions = ref([]);
const selectedRecipeId = ref(null);

// 配方选择辅助
const resourcesStore = useResourcesStore();
function openRecipeSelector(machine) {
  recipeSelectorMachine.value = machine;
  selectedRecipeId.value = machine.now_recipe || (machine.recipe_id?.[0] ?? null);
  recipeSelectorOptions.value = (machine.recipe_id || [])
    .map((id) => resourcesStore.recipes[id])
    .filter(Boolean);
  showRecipeSelector.value = true;
}
function confirmRecipe() {
  const m = recipeSelectorMachine.value;
  if (!m || !selectedRecipeId.value) return;
  setNowRecipe(m, selectedRecipeId.value);
  const obj = getMachineObject(m.id);
  if (obj?.refreshRecipeUI) obj.refreshRecipeUI();
  showRecipeSelector.value = false;
}
function cancelRecipe() {
  showRecipeSelector.value = false;
}

function onPlaceMachineClick() {
  selectedMachineType.value = null;
  showMachineSelector.value = true;
}
function confirmPlaceMachine() {
  if (!selectedMachineType.value) return;
  showMachineSelector.value = false;
  dispatchPlaceMachineHandle(selectedMachineType.value);
}
function cancelPlaceMachine() {
  showMachineSelector.value = false;
  selectedMachineType.value = null;
}

// 节点类型选择器状态
const nodeTypeOptions = ["split", "merge", "cross", "default"];
const showNodeSelector = ref(false);
const selectedNodeType = ref(null);
const selectedNodeKind = ref("belt"); // "belt" | "pipe"

function onPlaceNodeClick() {
  selectedNodeType.value = null;
  selectedNodeKind.value = "belt";
  showNodeSelector.value = true;
}
function confirmPlaceNode() {
  if (!selectedNodeType.value) return;
  showNodeSelector.value = false;
  dispatchPlaceNodeHandle(selectedNodeType.value, selectedNodeKind.value === 'belt');
}
function cancelPlaceNode() {
  showNodeSelector.value = false;
  selectedNodeType.value = null;
}

(async () => {
  globalThis.__PIXI_APP__ = app;
  drawGridLines();
  drawHitArea();
  initIndicator();
  resetPosition();
  resetScale();
  await app.init({
    width: storageStore.width,
    height: storageStore.height,
    backgroundColor: storageStore.backgroundColor,
    backgroundAlpha: storageStore.backgroundAlpha,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });
  canvas.value.appendChild(app.canvas);
})();

onMounted(() => {
  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("keydown", handleKeyboardForZoom);
  window.addEventListener("keyup", handleKeyboardUp);
  // 机器点击 → EventHandle → 打开配方选择
  setMachineClickHandler((machine) => openRecipeSelector(machine));
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
    <button @click="onPlaceMachineClick">Place Machine</button>
    <button @click="onPlaceNodeClick">Place Node</button>
    <button>Place Belt</button>
    <button>Delete Belt</button>
    <button>Delete Machine</button>
  </div>

  <!-- 机器类型选择弹框 -->
  <div v-if="showMachineSelector" class="machine-selector-overlay" @click.self="cancelPlaceMachine">
    <div class="machine-selector-dialog">
      <h3>选择机器类型</h3>
      <div class="machine-list">
        <div
          v-for="type in machineTypeList"
          :key="type"
          class="machine-item"
          :class="{ active: selectedMachineType === type }"
          @click="selectedMachineType = type"
        >
          <span class="machine-key">{{ type }}</span>
          <span class="machine-name">{{ machineStore.machineTypes[type]?.name || '' }}</span>
          <span class="machine-size">{{ machineStore.machineTypes[type]?.gridWidth }}x{{ machineStore.machineTypes[type]?.gridHeight }}</span>
        </div>
      </div>
      <div class="selector-actions">
        <button class="btn-cancel" @click="cancelPlaceMachine">取消</button>
        <button class="btn-confirm" :disabled="!selectedMachineType" @click="confirmPlaceMachine">确认放置</button>
      </div>
    </div>
  </div>

  <!-- 节点类型选择弹框 -->
  <div v-if="showNodeSelector" class="machine-selector-overlay" @click.self="cancelPlaceNode">
    ...
  </div>

  <!-- 配方选择弹框 -->
  <div v-if="showRecipeSelector" class="machine-selector-overlay" @click.self="cancelRecipe">
    <div class="machine-selector-dialog">
      <h3>选择配方 — {{ recipeSelectorMachine?.name || recipeSelectorMachine?.id }}</h3>
      <div class="machine-list">
        <div
          v-for="recipe in recipeSelectorOptions"
          :key="recipe.id"
          class="machine-item"
          :class="{ active: selectedRecipeId === recipe.id }"
          @click="selectedRecipeId = recipe.id"
        >
          <span class="machine-key">{{ recipe.name || recipe.id }}</span>
          <span class="machine-name">
            <span v-for="(cnt, item) in recipe.in" :key="'in-'+item" class="recipe-item">
              {{ item }}×{{ cnt }}
            </span>
            <span class="recipe-arrow">→</span>
            <span v-for="(cnt, item) in recipe.out" :key="'out-'+item" class="recipe-item">
              {{ item }}×{{ cnt }}
            </span>
          </span>
          <span class="machine-size">{{ recipe.time }}s</span>
        </div>
        <div v-if="recipeSelectorOptions.length === 0" class="empty-hint">
          该机器无可选配方
        </div>
      </div>
      <div class="selector-actions">
        <button class="btn-cancel" @click="cancelRecipe">取消</button>
        <button class="btn-confirm" :disabled="!selectedRecipeId" @click="confirmRecipe">确认</button>
      </div>
    </div>
  </div>

  <!-- 节点类型选择弹框 -->
  <div v-if="showNodeSelector" class="machine-selector-overlay" @click.self="cancelPlaceNode">
    <div class="machine-selector-dialog">
      <h3>选择节点类型</h3>
      <div class="selector-section">
        <label class="section-label">管线类型</label>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            :class="{ active: selectedNodeKind === 'belt' }"
            @click="selectedNodeKind = 'belt'"
          >传送带</button>
          <button
            class="toggle-btn"
            :class="{ active: selectedNodeKind === 'pipe' }"
            @click="selectedNodeKind = 'pipe'"
          >管道</button>
        </div>
      </div>
      <div class="selector-section">
        <label class="section-label">节点类型</label>
        <div class="node-list">
          <div
            v-for="type in nodeTypeOptions"
            :key="type"
            class="machine-item"
            :class="{ active: selectedNodeType === type }"
            @click="selectedNodeType = type"
          >
            <span class="node-key">{{ type }}</span>
          </div>
        </div>
      </div>
      <div class="selector-actions">
        <button class="btn-cancel" @click="cancelPlaceNode">取消</button>
        <button class="btn-confirm" :disabled="!selectedNodeType" @click="confirmPlaceNode">确认放置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.machine-selector-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.machine-selector-dialog {
  background: #1a1a2e;
  border: 1px solid #334;
  border-radius: 8px;
  padding: 20px;
  min-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.machine-selector-dialog h3 {
  margin: 0 0 12px;
  color: #ccc;
  font-size: 16px;
}
.machine-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
}
.machine-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  color: #aaa;
  transition: background 0.15s;
}
.machine-item:hover {
  background: #2a2a4a;
}
.machine-item.active {
  background: #3a3a6a;
  color: #fff;
}
.machine-key {
  font-family: monospace;
  min-width: 140px;
}
.machine-name {
  flex: 1;
  color: #888;
}
.machine-size {
  color: #666;
  font-family: monospace;
}
.selector-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.selector-actions button {
  padding: 6px 16px;
  border: 1px solid #445;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.btn-cancel {
  background: #2a2a3e;
  color: #999;
}
.btn-confirm {
  background: #3a5a8a;
  color: #fff;
  border-color: #4a7aba;
}
.btn-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 节点选择器 */
.selector-section {
  margin-bottom: 12px;
}
.section-label {
  display: block;
  color: #888;
  font-size: 13px;
  margin-bottom: 6px;
}
.toggle-group {
  display: flex;
  gap: 4px;
}
.toggle-btn {
  flex: 1;
  padding: 6px 0;
  border: 1px solid #445;
  border-radius: 4px;
  background: #2a2a3e;
  color: #999;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}
.toggle-btn.active {
  background: #3a5a8a;
  color: #fff;
  border-color: #4a7aba;
}
.node-list {
  max-height: 200px;
  overflow-y: auto;
}
.node-key {
  font-family: monospace;
  font-size: 14px;
}

/* 配方选择器 */
.recipe-item {
  font-size: 12px;
  color: #aaa;
  margin-right: 4px;
}
.recipe-arrow {
  margin: 0 6px;
  color: #666;
}
.empty-hint {
  text-align: center;
  color: #666;
  padding: 20px 0;
}
</style>
