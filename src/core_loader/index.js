import { loadAllConfigs } from "./LoadConfigs.js";

/**
 * 统一加载器入口
 *
 * 调用时机：app.use(pinia) 之后、app.mount() 之前
 *
 * 加载顺序：
 *   1. JSON configs（机器定义、节点类型等）→ 写入 Pinia store
 *   2. 图片资源 → Pixi 纹理缓存（后续拓展）
 *
 * 设计目标：
 *   - 开发期通过 Vite dev server 获取
 *   - 构建后从 dist/ 同级路径 fetch，可被外部工具直接修改
 */
export async function initLoader() {
  console.log("[Loader] init start");

  // Step 1: 加载 JSON 配置
  await loadAllConfigs();

  // Step 2: 预加载图片资源（预留）
  // await preloadAssets();

  console.log("[Loader] init complete");
}
