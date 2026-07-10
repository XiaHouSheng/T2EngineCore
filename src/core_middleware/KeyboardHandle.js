import {
  useCommandStore,
  CMD_DEFAULT,
  CMD_CANCEL,
} from "../stores/KeyBoardStore.js";

let commandStore = null;

function handleKeyboard(keyboardEvent) {
  if (!commandStore) commandStore = useCommandStore();
  const key = keyboardEvent.key.toLowerCase();

  let command = commandStore.keyboard_command[key];
  let sub_command = commandStore.keyboard_sub_command[key];
  let base_command = commandStore.keyboard_base_command[key];

  if (keyboardEvent.ctrlKey && key === "c") {
    command = commandStore.keyboard_command["copy"];
    sub_command = commandStore.keyboard_sub_command["copy"];
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

export { handleKeyboard };
