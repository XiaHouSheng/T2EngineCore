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
  onStartPlaceMachineRotate,
  onStartPlaceNode,
  onStartPlaceNodeRotate,
  onCancel,
} from "../core_sub/Indicator.js";
import {
  moveViewLeft,
  moveViewRight,
  moveViewUp,
  moveViewDown,
} from "../core_sub/Scale.js";
import { proxyForHandle } from "../core_middleware/IndicatorUtil.js";
export const useCommandStore = defineStore("command", () => {
  const select_command = ref("default");
  const last_command = ref("default");
  const is_ctrl = ref(false)

  const keyboard_command = markRaw({
    e: "PLACE_BELT",
    q: "PLACE_PIPE",
    x: "SELECT",
    escape: "CANCEL",
    m: "MOVE",
    r: "ROTATE",
    f: "DELETE",
    copy: "COPY",
    place_machine: "PLACE_MACHINE",
    place_node: "PLACE_NODE",
    w: "ZOOM_TOP",
    s: "ZOOM_BOTTOM",
    a: "ZOOM_LEFT",
    d: "ZOOM_RIGHT",
  });
  const keyboard_base_command = markRaw({
    e: "PLACE_BELT",
    q: "PLACE_PIPE",
    x: "SELECT",
    escape: "CANCEL",
    place_machine: "PLACE_MACHINE",
    place_node: "PLACE_NODE",
  });
  const keyboard_sub_command = markRaw({
    m: "MOVE",
    r: "ROTATE",
    f: "DELETE",
    copy: "COPY",
  });
  const command_handle = markRaw({
    // 单命令
    PLACE_BELT: onStartPlaceBelt,
    PLACE_PIPE: onStartPlacePipe,
    SELECT: onStartSelect,
    CANCEL: onCancel,
    // 组合命令
    PLACE_MACHINE_ROTATE: onStartPlaceMachineRotate,
    PLACE_NODE_ROTATE: onStartPlaceNodeRotate,
    PLACE_BELT_ROTATE: onStartPlaceChangeMode,
    PLACE_PIPE_ROTATE: onStartPlaceChangeMode,
    SELECT_MOVE: onStartSelectMove,
    SELECT_ROTATE: onStartSelectRotate,
    SELECT_DELETE: onStartSelectDelete,
    SELECT_COPY: onStartSelectCopy,
  });

  const zomm_command_handle = markRaw({
    w: moveViewDown,
    s: moveViewUp,
    a: moveViewRight,
    d: moveViewLeft,
  });

  // 代理命令处理函数
  for (let key in command_handle) {
    command_handle[key] = proxyForHandle(command_handle[key], key);
  }
  /*
  for (let key in zomm_command_handle) {
    zomm_command_handle[key] = proxyForHandle(zomm_command_handle[key], key, 0);
  }
  */

  return {
    keyboard_base_command,
    keyboard_command,
    keyboard_sub_command,
    select_command,
    last_command,
    is_ctrl,
    command_handle,
    zomm_command_handle,
    onCancel,
  };
});

export const CMD_DEFAULT = "default";
export const CMD_CANCEL = "CANCEL";
