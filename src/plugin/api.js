/**
 * api.js — 对外 API 聚合（纯重导出，无副作用）
 *
 * 供宿主项目统一从 "sim-engine" 导入使用。
 * 注意：调用依赖引擎 store 的 API 前，需先执行 createSimEngine() 完成初始化。
 */
export { useStorageStore } from "../stores/StorageStore.js";
export { useMachineStore } from "../stores/MachineStore.js";
export { useResourcesStore } from "../stores/ResourcesStore.js";
export { useBeltStore } from "../stores/BeltStore.js";
export { usePipeStore } from "../stores/PipeStore.js";
export { useCommandStore } from "../stores/CommandStore.js";

// MachineUtil — 机器数据获取/设置统一接口
export {
  getMachineById,
  getMachineByGrid,
  getId,
  getType,
  getName,
  getSize,
  getMask,
  getAnchor,
  getRecipeIds,
  getRotation,
  getPortOffsetIndex,
  getGridPosition,
  getPixelPosition,
  getCenterPixel,
  getNowRecipe,
  setNowRecipe,
  getNowMode,
  setNowMode,
  getPortRecipeIcon,
  setPortRecipeIcon,
  getMachineObject,
  getAllMachines,
  getAllMachineObjects,
} from "../core_middleware/MachineUtil.js";

// BackgroundGraphics
export { setBackgroundGraphic } from "../core_stage/ScaleStage.js";

// EventHandle — 事件回调注册
export { setMachineClickHandler } from "../core_middleware/EventHandle.js";

// KeyboardHandle — 命令注入器 / 键盘处理
export {
  handleKeyboard,
  handleKeyboardUp,
  handleKeyboardForZoom,
  dispatchPlaceMachineHandle,
  dispatchPlaceNodeHandle,
} from "../core_middleware/KeyboardHandle.js";

// 机器操作
export {
  createMachine,
  placeMachine,
  deleteMachine,
  rotateMachine,
  rotateMachineByCenter,
} from "../core_sub/Machine.js";

// 传送带操作
export {
  createBelt,
  createBeltNode,
  placeBelt,
  placeBeltNode,
  rotateBelt,
  rotateBeltNode,
  rotateBeltByCenter,
  deleteBelt,
  placeBatchBelt,
  deleteBatchBelt,
} from "../core_sub/Belt.js";

// 管道操作
export {
  createPipe,
  createPipeNode,
  placePipe,
  placePipeNode,
  rotatePipe,
  rotatePipeNode,
  rotatePipeByCenter,
  deletePipe,
  placeBatchPipe,
  deleteBatchPipe,
} from "../core_sub/Pipe.js";

// 指示器状态（S 为可变对象，谨慎使用）
export {
  S,
} from "../core_middleware/IndicatorState.js";

// 存储查询
export {
  saveMachine,
  dropMachine,
  getMachineByPosition,
  getMachineGridPosition,
  getMachineMaskTypeByPosition,
  mapMachineArea,
  mapMachineAreaWithType,
  getLeftTopPosition,
  getMachinePixelSize,
} from "../core_storage/MachineStorage.js";
export { saveBelt, dropBelt, findBeltNearBy, getBeltByPosition } from "../core_storage/BeltStorage.js";
export { savePipe, dropPipe, findPipeNearBy, getPipeByPosition } from "../core_storage/PipeStorage.js";

// 坐标转换
export {
  getCellSize,
  gridToPixel,
  pixelToGrid,
  pixelToGridNoneOffset,
} from "../core_middleware/PositionConvert.js";

// 蓝图操作（本地 CRUD / 文件导入导出 / 渲染）
export {
  initStoreBlueprint,
  createBlueprint,
  saveBlueprintLocal,
  clearBlueprintLocal,
  deleteBlueprintLocal,
  selectBlueprintLocal,
  addBlueprintLocal,
  loadBlueprintFromFile,
  exportBlueprintToFile,
  importBlueprintFromData,
  setBlueprintCallbacks,
} from "../core_blueprint/Blueprint.js";
export {
  renderBlueprint,
  clearBlueprint,
} from "../core_blueprint/BlueprintStage.js";

