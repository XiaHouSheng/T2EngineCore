import {
  useCommandStore,
  CMD_DEFAULT,
  CMD_CANCEL,
} from "../stores/CommandStore.js";
import {
  onStartPlaceMachine,
  onStartPlaceNode,
} from "../core_sub/Indicator.js";
import { saveBlueprintLocal } from "../core_blueprint/Blueprint.js";

let commandStore = null;

/**
 * 判断事件目标是否为可编辑元素（输入框/文本域/下拉框/富文本）
 * 用户在这些控件内输入时不应触发引擎命令
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
function isTypingTarget(event) {
  const target = event.target;
  if (!target || typeof target.tagName !== "string") return false;
  const tag = target.tagName.toUpperCase();
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable === true
  );
}

function dispatchPlaceMachineHandle(typeName) {
  if (!commandStore) commandStore = useCommandStore();
  handleKeyboard({ key: "place_machine" });
  onStartPlaceMachine(typeName);
}

function dispatchPlaceNodeHandle(typeName, is_belt = true) {
  if (!commandStore) commandStore = useCommandStore();
  handleKeyboard({ key: "place_node" });
  onStartPlaceNode(typeName, is_belt);
}

function handleKeyboardForZoom(event) {
  if (isTypingTarget(event)) return;
  if (!commandStore) commandStore = useCommandStore();
  const key = event.key.toLowerCase();
  const func = commandStore.zomm_command_handle[key];
  if (func && !event.ctrlKey) func();
}

function handleKeyboardUp(keyboardEvent) {
  if (!commandStore) commandStore = useCommandStore();
  commandStore.is_ctrl = keyboardEvent.ctrlKey;
}

function handleKeyboard(keyboardEvent) {
  if (isTypingTarget(keyboardEvent)) return;
  if (!commandStore) commandStore = useCommandStore();
  commandStore.is_ctrl = keyboardEvent.ctrlKey;
  const key = keyboardEvent.key.toLowerCase();

  let command = commandStore.keyboard_command[key];
  let sub_command = commandStore.keyboard_sub_command[key];
  let base_command = commandStore.keyboard_base_command[key];

  if (keyboardEvent.ctrlKey && key === "c") {
    command = commandStore.keyboard_command["copy"];
    sub_command = commandStore.keyboard_sub_command["copy"];
  }

  if (keyboardEvent.ctrlKey && key === "s") {
    keyboardEvent.preventDefault();
    saveBlueprintLocal();
  }

  // 上一条命令 | 用于子命令的存储
  const last_command = commandStore.last_command;
  // 当前命令
  const select_command = commandStore.select_command;

  // 无配置命令
  if (!command) return;
  // 取消命令
  if (command === CMD_CANCEL) {
    const func = commandStore.command_handle[command];
    if (func) func();
    commandStore.last_command = CMD_DEFAULT;
    commandStore.select_command = CMD_DEFAULT;
    return;
  }

  // 重复命令 | 若为基命令则跳过 | 若为子命令则触发组合命令
  if (base_command && select_command === base_command) {
    return;
  }
  if (sub_command && last_command === sub_command) {
    const func = commandStore.command_handle[`${select_command}_${command}`];
    if (func) func();
    return;
  }

  // 基命令直接执行 | 并重置子命令存储为默认值
  if (base_command) {
    const func = commandStore.command_handle[command];
    if (func) func();
    // 执行基命令后，重置子命令为默认值
    commandStore.select_command = command;
    commandStore.last_command = commandStore.CMD_DEFAULT;
  }

  // 子命令直接执行
  if (sub_command) {
    const func = commandStore.command_handle[`${select_command}_${command}`];
    if (func) {
      func();
    } else {
      return;
    }
    commandStore.last_command = command;
  }
}

export {
  handleKeyboard,
  handleKeyboardUp,
  handleKeyboardForZoom,
  dispatchPlaceMachineHandle,
  dispatchPlaceNodeHandle,
};
