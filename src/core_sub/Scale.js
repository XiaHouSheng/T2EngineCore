import { useStorageStore } from "../stores/StorageStore";
import {
  setPosition,
  setScale,
} from "../core_stage/ScaleStage.js";

let storageStore = null;

// 处理滚轮事件
function onWheelChange(event) {
  if (!storageStore) storageStore = useStorageStore();
  const { x: offsetX, y: offsetY } = storageStore.offset_position;
  // event.screen 为 canvas 内部坐标（已补偿 canvas 位置/CSS 缩放/DPR）
  const { x: mouseX, y: mouseY } = event.screen;
  const oldScale = storageStore.scale;
  const worldX = (mouseX - offsetX) / oldScale;
  const worldY = (mouseY - offsetY) / oldScale;
  const zoomRate = event.deltaY > 0 ? 0.95 : 1.05;
  let scale = Math.max(0.8, Math.min(4, storageStore.scale * zoomRate));
  const newOffsetX = mouseX - worldX * scale;
  const newOffsetY = mouseY - worldY * scale;
  storageStore.scale = scale;
  setScale(scale);
  const {
    confirmOffsetX,
    confirmOffsetY,
  } = setPosition(newOffsetX, newOffsetY);
  if (confirmOffsetX !== undefined && confirmOffsetY !== undefined) {
    storageStore.offset_position = { x: confirmOffsetX, y: confirmOffsetY };
  }
}

function moveViewLeft() {
  if (!storageStore) storageStore = useStorageStore();
  let step = storageStore.base_step / storageStore.scale;
  const newOffsetX = storageStore.offset_position.x - step;
  const newOffsetY = storageStore.offset_position.y;
  const {
    confirmOffsetX,
    confirmOffsetY,
  } = setPosition(newOffsetX, newOffsetY);
  if (confirmOffsetX !== undefined && confirmOffsetY !== undefined) {
    storageStore.offset_position = { x: confirmOffsetX, y: confirmOffsetY };
  }
}

function moveViewRight() {
  if (!storageStore) storageStore = useStorageStore();
  let step = storageStore.base_step / storageStore.scale;
  const newOffsetX = storageStore.offset_position.x + step;
  const newOffsetY = storageStore.offset_position.y;
  const {
    confirmOffsetX,
    confirmOffsetY,
  } = setPosition(newOffsetX, newOffsetY);
  if (confirmOffsetX !== undefined && confirmOffsetY !== undefined) {
    storageStore.offset_position = { x: confirmOffsetX, y: confirmOffsetY };
  }
}

function moveViewUp() {
  if (!storageStore) storageStore = useStorageStore();
  let step = storageStore.base_step / storageStore.scale;
  const newOffsetX = storageStore.offset_position.x;
  const newOffsetY = storageStore.offset_position.y - step;
  const {
    confirmOffsetX,
    confirmOffsetY,
  } = setPosition(newOffsetX, newOffsetY);
  if (confirmOffsetX !== undefined && confirmOffsetY !== undefined) {
    storageStore.offset_position = { x: confirmOffsetX, y: confirmOffsetY };
  } 
}

function moveViewDown() {
  if (!storageStore) storageStore = useStorageStore();
  let step = storageStore.base_step / storageStore.scale;
  const newOffsetX = storageStore.offset_position.x;
  const newOffsetY = storageStore.offset_position.y + step;
  const {
    confirmOffsetX,
    confirmOffsetY,
  } = setPosition(newOffsetX, newOffsetY);
  if (confirmOffsetX !== undefined && confirmOffsetY !== undefined) {
    storageStore.offset_position = { x: confirmOffsetX, y: confirmOffsetY };
  } 
}

export { onWheelChange, moveViewLeft, moveViewRight, moveViewUp, moveViewDown };
