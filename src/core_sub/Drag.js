import { useStorageStore } from "../stores/StorageStore";
import { useCommandStore, CMD_DEFAULT } from "../stores/KeyBoardStore";
import { setPosition } from "../core_stage/ScaleStage";

let start_pixel_x, start_pixel_y, end_pixel_x, end_pixel_y;
let storageStore, commandStore;

function lazyLoad() {
  if (!storageStore) storageStore = useStorageStore();
  if (!commandStore) commandStore = useCommandStore();
}

function handleDragStart(event) {
  lazyLoad();
  start_pixel_x = event.client.x;
  start_pixel_y = event.client.y;
  //console.log("handleDragStart");
}

function handleDragMove(event) {
  lazyLoad();
  if (commandStore.select_command != CMD_DEFAULT) return;
  const { x: offsetX, y: offsetY } = storageStore.offset_position;
  end_pixel_x = event.client.x;
  end_pixel_y = event.client.y;
  if (start_pixel_x == null || start_pixel_y == null) return;
  const deltaX = end_pixel_x - start_pixel_x;
  const deltaY = end_pixel_y - start_pixel_y;
  const newOffsetX = offsetX + deltaX;
  const newOffsetY = offsetY + deltaY;
  const { confirmOffsetX, confirmOffsetY } = setPosition(
    newOffsetX,
    newOffsetY,
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
  //console.log("handleDragEnd");
}

export { handleDragEnd, handleDragStart, handleDragMove };
