/**
 * EventHandle — 机器交互事件的处理回调
 *
 * 外部模块（如 Index.vue）通过 setMachineClickHandler 注册回调，
 * handleMachineClick 由 EventDispatcher 的机器点击事件触发。
 */

let _onMachineClick = null;

/**
 * 注册机器点击处理回调
 * @param {(machine: object) => void} fn — 接收被点击的 machine 对象
 */
function setMachineClickHandler(fn) {
  _onMachineClick = fn;
}

/**
 * 由 EventDispatcher 触发的机器点击事件入口
 * @param {object} machine
 */
function handleMachineClick(machine) {
  if (_onMachineClick) _onMachineClick(machine);
}

export { handleMachineClick, setMachineClickHandler };
