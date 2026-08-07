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

  const { width: vw, height: vh, scale, max_offset } = storageStore;


  // viewport中心（pivot中心）
  const centerX = vw / 2;
  const centerY = vh / 2;


  // 缩放后内容超出的范围
  const scaleOffsetX = vw * (scale - 1) / 2;
  const scaleOffsetY = vh * (scale - 1) / 2;


  // 保持视觉一致的拖拽余量
  const dragThreshold = max_offset * scale;


  const radiusX = scaleOffsetX + dragThreshold;
  const radiusY = scaleOffsetY + dragThreshold;


  const minX = centerX - radiusX;
  const maxX = centerX + radiusX;

  const minY = centerY - radiusY;
  const maxY = centerY + radiusY;


  viewportContainer.x =
    minX >= maxX
      ? centerX
      : clamp(x, minX, maxX);

  viewportContainer.y =
    minY >= maxY
      ? centerY
      : clamp(y, minY, maxY);


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
  lazyLoad();
  const { width, height} = storageStore;
  const minWidth = Math.min(width, height);
  const positionX = width / 2;
  const positionY = height / 2;
  viewportContainer.pivot.set(minWidth / 2)
  viewportContainer.x = positionX;
  viewportContainer.y = positionY;
  storageStore.offset_position = { x: positionX, y: positionY };
}

function setBackgroundGraphic(graphic) {
  viewportContainer.addChildAt(graphic, viewportContainer.children.length - 1);
}

export { setPosition, setScale, resetScale, resetPosition, setBackgroundGraphic };
