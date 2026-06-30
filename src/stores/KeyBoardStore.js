import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import {
  onStartPlaceBelt,
  onStartPlacePipe,
  onStartSelect,
  onStartSelectMove,
  onStartSelectRotate,
  onStartSelectDelete,
  onCancel,
} from "../core_sub/Indicator.js";
export const useCommandStore = defineStore("command", () => {
  const select_command = ref("default");
  const keyboard_command = markRaw({
    e: "PLACE_BELT",
    q: "PLACE_PIPE",
    x: "SELECT",
    escape: "CANCEL",
    m: "MOVE",
    r: "ROTATE",
    f: "DELETE",
  });
  const command_keyboard = markRaw({
    PLACE_BELT: "e",
    PLACE_PIPE: "q",
    SELECT: "x",
    CANCEL: "escape",
    MOVE: "m",
    ROTATE: "r",
    DELETE: "f",
  });
  const command_handle = markRaw({
    // 单命令
    PLACE_BELT: onStartPlaceBelt,
    PLACE_PIPE: onStartPlacePipe,
    SELECT: onStartSelect,
    CANCEL: onCancel,
    // 组合命令
    PLACE_BELT_PLACE_PIPE: onStartPlacePipe,
    PLACE_PIPE_PLACE_BELT: onStartPlaceBelt,
    SELECT_MOVE: onStartSelectMove,
    SELECT_ROTATE: onStartSelectRotate,
    SELECT_DELETE: onStartSelectDelete,
  });
  return { keyboard_command, select_command, command_keyboard, command_handle };
});

export const CMD_DEFAULT = "default";
export const CMD_CANCEL = "CANCEL";