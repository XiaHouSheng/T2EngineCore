/**
 * MachineUtil — 机器数据获取/设置统一接口
 *
 * 职责：
 * - 封装 storageStore.machines 的读写
 * - 元数据字段（id/type/name/size/mask/anchor/recipe_id）只提供 getter
 * - 运行时状态字段（now_recipe/now_mode）提供 getter + setter
 * - 通过机器 id 或网格坐标定位机器
 */

import { useStorageStore } from "../stores/StorageStore.js";
import { getMachineByPosition } from "../core_storage/MachineStorage.js";

/* ============================== 定位 ============================== */

/** 通过 id 获取机器元数据 */
function getMachineById(id) {
  return useStorageStore().machines[id] ?? null;
}

/** 通过网格坐标获取机器元数据（同 MachineStorage.getMachineByPosition） */
function getMachineByGrid(gridX, gridY) {
  return getMachineByPosition(gridX, gridY);
}

/* ============================== 元数据 (只读 getter) ============================== */

function getId(machine) {
  return machine.id;
}
function getType(machine) {
  return machine.type;
}
function getName(machine) {
  return machine.name;
}
function getSize(machine) {
  return { gridWidth: machine.gridWidth, gridHeight: machine.gridHeight };
}
function getMask(machine) {
  return machine.mask;
}
function getAnchor(machine) {
  return machine.anchor;
}
function getRecipeIds(machine) {
  return machine.recipe_id;
}
function getRotation(machine) {
  return machine.rotation;
}
function getPortOffsetIndex(machine) {
  return machine.port_offset_index;
}

/* ============================== 位置 (只读 getter) ============================== */

function getGridPosition(machine) {
  return { gridX: machine.gridX, gridY: machine.gridY };
}
function getPixelPosition(machine) {
  return { x: machine.x, y: machine.y };
}
function getCenterPixel(machine) {
  return { centerX: machine.centerX, centerY: machine.centerY };
}

/* ============================== 运行时状态 (可读写) ============================== */

function getNowRecipe(machine) {
  return machine.now_recipe;
}
function setNowRecipe(machine, recipeId) {
  machine.now_recipe = recipeId;
}

function getNowMode(machine) {
  return machine.now_mode;
}
function setNowMode(machine, mode) {
  machine.now_mode = mode;
}

/* ============================== 容器对象 ============================== */

/** 获取机器的 PIXI 容器对象（用于渲染更新） */
function getMachineObject(id) {
  return useStorageStore().machineObjects[id] ?? null;
}

/* ============================== 快捷批量 ============================== */

/** 获取所有已放置的机器元数据（{ id → machine }） */
function getAllMachines() {
  return useStorageStore().machines;
}

/** 获取所有机器容器对象（{ id → MachineContainer }） */
function getAllMachineObjects() {
  return useStorageStore().machineObjects;
}

export {
  // 定位
  getMachineById,
  getMachineByGrid,
  // 元数据只读
  getId,
  getType,
  getName,
  getSize,
  getMask,
  getAnchor,
  getRecipeIds,
  getRotation,
  getPortOffsetIndex,
  // 位置只读
  getGridPosition,
  getPixelPosition,
  getCenterPixel,
  // 运行时状态
  getNowRecipe,
  setNowRecipe,
  getNowMode,
  setNowMode,
  // 容器
  getMachineObject,
  // 批量
  getAllMachines,
  getAllMachineObjects,
};
