import { useStorageStore } from "../stores/StorageStore.js";
import { renderBlueprint, clearBlueprint } from "./BlueprintStage.js";
import { nanoid } from "nanoid";

let callbackOnInit, callbackOnSelectBlueprint;

function setBlueprintCallbacks(
  onInit,
  onSelectBlueprint
) {
  callbackOnInit = onInit || (() => {});
  callbackOnSelectBlueprint = onSelectBlueprint || (() => {});
}

function createBlueprint(name, id, content) {
  return {
    name,
    id: id || nanoid(),
    content: content || {
      machines: {},
      belts: {},
      pipes: {},
    },
  };
}

// 深拷贝：蓝图保存/加载必须与画布数据解耦，避免引用共享互相污染
function cloneContent(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function initStoreBlueprint() {
  const storageStore = useStorageStore();
  // 首次启动或持久化数据不完整时，创建默认蓝图
  if (
    !storageStore.current_blueprint ||
    !storageStore.blueprints[storageStore.current_blueprint]
  ) {
    const temp_blueprint = createBlueprint("New Blueprint");
    storageStore.current_blueprint = temp_blueprint.id;
    storageStore.blueprints[temp_blueprint.id] = temp_blueprint;
  }
  renderBlueprint(storageStore.blueprints[storageStore.current_blueprint]);
  callbackOnInit(storageStore.current_blueprint);
}

function saveBlueprintLocal() {
  const storageStore = useStorageStore();
  const current_blueprint_id = storageStore.current_blueprint;
  const current_blueprint = storageStore.blueprints[current_blueprint_id];
  if (!current_blueprint) return;
  // 深拷贝画布数据，保存后与画布解耦
  // （否则画布后续任何放置/删除都会污染已保存的蓝图内容）
  current_blueprint.content = {
    machines: cloneContent(storageStore.machines),
    belts: cloneContent(storageStore.belts),
    pipes: cloneContent(storageStore.pipes),
  };
}

function clearBlueprintLocal(id) {
  const storageStore = useStorageStore();
  const current_blueprint_id = id || storageStore.current_blueprint;
  const current_blueprint = storageStore.blueprints[current_blueprint_id];
  if (!current_blueprint) return;
  // 重置为空白蓝图（保留名称与 id）
  storageStore.blueprints[current_blueprint_id] = createBlueprint(
    current_blueprint.name,
    current_blueprint.id,
  );
  // 若清空的是当前蓝图，同步清空画布
  if (storageStore.current_blueprint === current_blueprint_id) {
    clearBlueprint();
  }
}

function deleteBlueprintLocal(id) {
  if (!id) return;
  const storageStore = useStorageStore();
  // blueprints 是对象，必须用 Object.keys 统计数量
  if (Object.keys(storageStore.blueprints).length > 1) {
    delete storageStore.blueprints[id];
    // 删除的是当前蓝图时切换到剩余的第一个；删除其他蓝图不打扰当前编辑
    if (storageStore.current_blueprint === id) {
      selectBlueprintLocal(Object.keys(storageStore.blueprints)[0]);
    }
  } else {
    // 最后一个蓝图：清空数据而非删除
    clearBlueprintLocal(id);
  }
}

function selectBlueprintLocal(id) {
  const storageStore = useStorageStore();
  if (!id || !storageStore.blueprints[id]) return;
  // 保存当前蓝图
  saveBlueprintLocal();
  // 切换到新蓝图
  storageStore.current_blueprint = id;
  // 清除旧蓝图(画布)
  clearBlueprint();
  // 渲染新蓝图(画布)
  renderBlueprint(storageStore.blueprints[id]);
  // 调用选择蓝图回调
  callbackOnSelectBlueprint(id);
}

function loadBlueprintFromFile() {
  // 创建临时文件选择器，读取 JSON 蓝图文件
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        importBlueprintFromData(data);
      } catch (error) {
        console.error("蓝图文件解析失败:", error);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function importBlueprintFromData(data) {
  const storageStore = useStorageStore();
  // 校验导入数据的基本结构
  if (!data || typeof data !== "object" || !data.content) return;
  const { machines = {}, belts = {}, pipes = {} } = data.content;
  if (
    typeof machines !== "object" ||
    typeof belts !== "object" ||
    typeof pipes !== "object"
  ) {
    return;
  }
  // 生成全新 id，避免与现有蓝图冲突；深拷贝内容与画布解耦
  const blueprint = createBlueprint(
    data.name || "Imported Blueprint",
    undefined,
    {
      machines: cloneContent(machines),
      belts: cloneContent(belts),
      pipes: cloneContent(pipes),
    },
  );
  storageStore.blueprints[blueprint.id] = blueprint;
  // 切换并渲染导入的蓝图
  selectBlueprintLocal(blueprint.id);
}

function exportBlueprintToFile() {
  const storageStore = useStorageStore();
  const current_blueprint =
    storageStore.blueprints[storageStore.current_blueprint];
  if (!current_blueprint) return;
  // 先同步画布到当前蓝图，确保导出的是最新内容
  saveBlueprintLocal();
  const data = storageStore.blueprints[storageStore.current_blueprint];
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${data.name}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function addBlueprintLocal(name) {
  const storageStore = useStorageStore();
  if (!name || name.trim() === "") return;
  const blueprint = createBlueprint(name);
  storageStore.blueprints[blueprint.id] = blueprint;
  selectBlueprintLocal(blueprint.id);
}

export {
  createBlueprint,
  deleteBlueprintLocal,
  selectBlueprintLocal,
  clearBlueprintLocal,
  addBlueprintLocal,
  saveBlueprintLocal,
  loadBlueprintFromFile,
  exportBlueprintToFile,
  importBlueprintFromData,
};
export { setBlueprintCallbacks };
export { initStoreBlueprint };
