import { useStorageStore } from "../stores/StorageStore";
import { useCommandStore, CMD_DEFAULT } from "../stores/KeyBoardStore";
import { setPosition } from "../core_stage/ScaleStage";

let start_pixel_x, start_pixel_y, end_pixel_x, end_pixel_y;
let start_offset_x, start_offset_y;
let storageStore, commandStore;

function lazyLoad() {
  if (!storageStore) storageStore = useStorageStore();
  if (!commandStore) commandStore = useCommandStore();
}

function handleDragStart(event) {
  lazyLoad();
  // event.screen 为 canvas 内部坐标（Pixi 已补偿位置/CSS 缩放/DPR）
  start_pixel_x = event.screen.x;
  start_pixel_y = event.screen.y;
  // 记录按下时的视口偏移，拖动期间以它为基准做绝对定位
  const { x: offsetX, y: offsetY } = storageStore.offset_position;
  start_offset_x = offsetX;
  start_offset_y = offsetY;
  //console.log("handleDragStart");
}

function handleDragMove(event) {
  lazyLoad();
  if (commandStore.select_command != CMD_DEFAULT) return;
  const { scale } = storageStore;
  end_pixel_x = event.screen.x;
  end_pixel_y = event.screen.y;
  if (start_pixel_x == null || start_pixel_y == null) return;
  // 屏幕位移换算为视口世界位移（除以 scale），并相对按下时偏移绝对定位，
  // 避免在 mousemove 里基于已更新的 offset 累加导致位移成倍累积
  const deltaX = (end_pixel_x - start_pixel_x) / scale;
  const deltaY = (end_pixel_y - start_pixel_y) / scale;
  const { confirmOffsetX, confirmOffsetY } = setPosition(
    start_offset_x + deltaX,
    start_offset_y + deltaY,
  );
  if (confirmOffsetX !== undefined && confirmOffsetY !== undefined) {
    storageStore.offset_position = { x: confirmOffsetX, y: confirmOffsetY };
  }
  //console.log("handleDragMove", deltaX, deltaY);
}

function handleDragEnd(event) {
  start_pixel_x = null;
  start_pixel_y = null;
  end_pixel_x = null;
  end_pixel_y = null;
  start_offset_x = null;
  start_offset_y = null;
  //console.log("handleDragEnd");
}

export { handleDragEnd, handleDragStart, handleDragMove };
