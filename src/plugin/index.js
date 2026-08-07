/**
 * index.js — 引擎插件入口
 *
 * 两种使用方式：
 *
 * 1) 函数式：
 *    import { createSimEngine } from "sim-engine";
 *    const engine = await createSimEngine({ width: 800, height: 600 });
 *    document.getElementById("root").appendChild(engine.canvas);
 *
 * 2) Vue 插件式：
 *    import SimEngine from "sim-engine";
 *    const app = createApp(App);
 *    app.use(SimEngine, { width: 800, height: 600 }); // 注册 <SimCanvas />
 *
 * 对外 API 全部通过本入口重导出（见 api.js）。
 */
import { ensureEngine, getEngine, getPinia, destroyEngine } from "./engine.js";
import SimCanvas from "./SimCanvas.vue";
export * from "./api.js";

/** 创建（或获取）引擎单例 */
export { ensureEngine as createSimEngine, getEngine, getPinia, destroyEngine };
export { SimCanvas };

/** Vue 插件对象 */
const SimEnginePlugin = {
  /**
   * @param {import("vue").App} app
   * @param {{ width?: number, height?: number, antialias?: boolean, backgroundColor?: number }} options
   */
  async install(app, options = {}) {
    const engine = await ensureEngine(options);
    // 将引擎 pinia 安装到宿主应用，使引擎 store 可在宿主组件中直接 useXxxStore()
    app.use(engine.pinia);
    app.component("SimCanvas", SimCanvas);
    app.config.globalProperties.$simEngine = engine;
    return engine;
  },
};

export default SimEnginePlugin;
