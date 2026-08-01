import { viewportContainer } from "./SimStage";
import { useStorageStore } from "../stores/StorageStore";

let storageStore = null;

function lazyLoad() {
  if (!storageStore) storageStore = useStorageStore();
}

function clamp(val, min, max) {
  return val < min ? min : val > max ? max : val;
}

function setPosition(x, y) {
  lazyLoad();
  const { width: vw, height: vh, scale } = storageStore;
  const cw = vw;
  const ch = vh;
  const margin = storageStore.width - storageStore.max_offset;
  const minX = margin - cw * scale;
  const maxX = vw - margin;
  const minY = margin - ch * scale;
  const maxY = vh - margin;

  viewportContainer.x = minX >= maxX ? (minX + maxX) / 2 : clamp(x, minX, maxX);
  viewportContainer.y = minY >= maxY ? (minY + maxY) / 2 : clamp(y, minY, maxY);

  return {
    confirmOffsetX: viewportContainer.x,
    confirmOffsetY: viewportContainer.y,
  };
}

function setScale(scale) {
  viewportContainer.scale.set(scale);
}

function resetScale() {
  setScale(1);
}

function resetPosition() {
  setPosition(0, 0);
}

function setBackgroundGraphic(graphic) {
  viewportContainer.addChildAt(graphic, viewportContainer.children.length - 1);
}

export { setPosition, setScale, resetScale, resetPosition, setBackgroundGraphic };
