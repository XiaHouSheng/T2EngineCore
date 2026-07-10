import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import {
  onStartPlaceBelt,
  onStartPlacePipe,
  onStartSelect,
  onStartSelectMove,
  onStartSelectRotate,
  onStartSelectDelete,
  onStartPlaceChangeMode,
  onStartSelectCopy,
  onCancel,
  proxyForHandle,
} from "../core_sub/Indicator.js";
export const useCommandStore = defineStore("command", () => {
  const select_command = ref("default");
  const last_command = ref("default");
  const keyboard_command = markRaw({
    e: "PLACE_BELT",
    q: "PLACE_PIPE",
    x: "SELECT",
    escape: "CANCEL",
    m: "MOVE",
    r: "ROTATE",
    f: "DELETE",
    copy: "COPY",
  });
  const keyboard_base_command = markRaw({
    e: "PLACE_BELT",
    q: "PLACE_PIPE",
    x: "SELECT",
    escape: "CANCEL",
  })
  const keyboard_sub_command = markRaw({
    m: "MOVE",
    r: "ROTATE",
    f: "DELETE",
    copy: "COPY",
  })
  const command_handle = markRaw({
    // 单命令
    PLACE_BELT: onStartPlaceBelt,
    PLACE_PIPE: onStartPlacePipe,
    SELECT: onStartSelect,
    CANCEL: onCancel,
    // 组合命令
    PLACE_BELT_ROTATE: onStartPlaceChangeMode,
    PLACE_PIPE_ROTATE: onStartPlaceChangeMode,
    SELECT_MOVE: onStartSelectMove,
    SELECT_ROTATE: onStartSelectRotate,
    SELECT_DELETE: onStartSelectDelete,
    SELECT_COPY: onStartSelectCopy,
  });

  // 代理命令处理函数
  for (let key in command_handle) {
    command_handle[key] = proxyForHandle(command_handle[key], key);
  }

  return { keyboard_base_command, keyboard_command, keyboard_sub_command, select_command, last_command, command_handle };
});

export const CMD_DEFAULT = "default";
export const CMD_CANCEL = "CANCEL";