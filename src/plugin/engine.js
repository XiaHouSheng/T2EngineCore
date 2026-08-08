/**
 * engine.js — 引擎生命周期管理（单例）
 *
 * 职责：
 * - 创建引擎专用 Pinia 实例并设为 active（引擎内部模块在非组件上下文调用 useXxxStore）
 * - 初始化 Pixi 场景（drawGridLines / drawHitArea / initIndicator / app.init）
 * - 加载配置与资源（initLoader）
 * - 提供 mount / destroy 生命周期
 *
 * 注意：本文件是新增的插件层，不修改任何现有源码。
 */
import { createPinia, setActivePinia } from "pinia";
import { app } from "../core_stage/SimStage.js";
import { drawGridLines, drawHitArea } from "../core_stage/SimInit.js";
import { initIndicator } from "../core_sub/Indicator.js";
import { initLoader } from "../core_loader/index.js";
import {
  handleKeyboard,
  handleKeyboardUp,
  handleKeyboardForZoom,
} from "../core_middleware/KeyboardHandle.js";
import { useStorageStore } from "../stores/StorageStore.js";
import { initStoreBlueprint } from "../core_blueprint/Blueprint.js";

/** @type {{ app, canvas, pinia, mount, destroy } | null} */
let _engine = null;
/** @type {ReturnType<typeof createPinia> | null} */
let _pinia = null;

/**
 * 获取（或创建）引擎单例
 * @param {{ width?: number, height?: number, antialias?: boolean, backgroundColor?: number }} options
 * @returns 引擎对象
 */
export async function ensureEngine(options = {}) {
  if (_engine) return _engine;

  // 1. 创建引擎专用 pinia 并设为 active
  _pinia = createPinia();
  setActivePinia(_pinia);

  // 2. 注册全局键盘事件（与原 Index.vue 保持一致）
  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("keydown", handleKeyboardForZoom);
  window.addEventListener("keyup", handleKeyboardUp);

  // 3. 初始化 Pixi 场景（顺序与 Index.vue 保持一致）
  drawGridLines();
  drawHitArea();
  initIndicator();
  resetPosition();
  resetScale();

  const storageStore = useStorageStore();
  await app.init({
    width: options.width ?? storageStore.width,
    height: options.height ?? storageStore.height,
    backgroundColor: options.backgroundColor ?? storageStore.backgroundColor,
    backgroundAlpha: options.backgroundAlpha ?? storageStore.backgroundAlpha,
    antialias: options.antialias ?? true,
  });

  // 4. 初始化蓝图存储
  initStoreBlueprint();

  // 5. 加载配置与资源
  await initLoader();

  _engine = {
    app,
    canvas: app.canvas,
    pinia: _pinia,
    /** 将引擎 canvas 挂载到 DOM 容器 */
    mount(el) {
      el.appendChild(app.canvas);
    },
    /** 销毁引擎，移除 canvas 与全局键盘事件 */
    async destroy() {
      window.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("keydown", handleKeyboardForZoom);
      window.removeEventListener("keyup", handleKeyboardUp);
      app.destroy({ removeView: true, children: true });
      _engine = null;
      _pinia = null;
    },
  };

  return _engine;
}

/** 获取已创建的引擎（未创建时返回 null） */
export function getEngine() {
  return _engine;
}

/** 获取引擎 pinia 实例（未创建时返回 null） */
export function getPinia() {
  return _pinia;
}

/** 销毁引擎单例 */
export async function destroyEngine() {
  if (_engine) await _engine.destroy();
}
