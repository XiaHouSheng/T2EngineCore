import { createApp } from "vue";
import "./style.css";
import { createPinia } from "pinia";
import App from "./App.vue";
import { initLoader } from "./core_loader/index.js";

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);

  // 加载配置与资源后挂载
  await initLoader();

  app.mount("#app");
}

bootstrap();
