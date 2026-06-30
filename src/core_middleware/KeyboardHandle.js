import { useCommandStore, CMD_DEFAULT, CMD_CANCEL } from "../stores/KeyBoardStore.js";

let commandStore = null;

function handleKeyboard(keyboardEvent) {
  if (!commandStore) commandStore = useCommandStore();
  const key = keyboardEvent.key.toLowerCase();
  const command = commandStore.keyboard_command[key];
  const last_command = commandStore.select_command;
  //console.log(key, command, last_command);
  // 无配置命令
  if (!command) return;
  // 取消命令
  if (command === CMD_CANCEL) {
    const func = commandStore.command_handle[command];
    if (func) func();
    commandStore.select_command = CMD_DEFAULT;
    return;
  }
  // 重复命令
  if (last_command === command) return;
  // 无命令时，直接执行
  if (last_command === CMD_DEFAULT) {
    const func = commandStore.command_handle[command];
    if (func) func();
  } else {
    // 有命令时，组合命令
    const func = commandStore.command_handle[`${last_command}_${command}`];
    if (func) { func() } else { return }
  }
  commandStore.select_command = command;
}

export { handleKeyboard };
