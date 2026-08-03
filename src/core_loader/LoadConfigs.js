import { Assets } from "pixi.js";
import { useMachineStore } from "../stores/MachineStore.js";
import { useResourcesStore } from "../stores/ResourcesStore.js";

const BASE = import.meta.env.BASE_URL; // 适配 Vite base 路径

const CONFIG_PATHS = {
  machines: `${BASE}configs/machines.json`,
  machine_config: `${BASE}configs/machines.json`,
  data: `${BASE}configs/data.json`,
  iconsheet: `${BASE}resources/icons.webp`,
};

// public/textures/ 下所有 PNG 文件名（不含扩展名作 key）
const TEXTURE_FILES = [
  "bg_logistic_log_conditioner",
  "bg_logistic_log_connector",
  "bg_logistic_log_converger",
  "bg_logistic_log_pipe_conditioner",
  "bg_logistic_log_pipe_connector",
  "bg_logistic_log_pipe_converger",
  "bg_logistic_log_pipe_splitter",
  "bg_logistic_log_splitter",
  "bg_machine_carrier_1",
  "bg_machine_combat_building",
  "bg_machine_default",
  "bg_machine_liquid_storager_1",
  "bg_machine_loader",
  "bg_machine_log_hongs_bus",
  "bg_machine_log_hongs_bus_source",
  "bg_machine_marker_1",
  "bg_machine_power",
  "bg_machine_power_pole_2",
  "bg_machine_squirter_1",
  "bg_machine_travel_pole_1",
  "bg_machine_underground_pipe_1",
  "bg_machine_underground_pipe_2",
  "bg_machine_unloader",
  "bg_icon_circle",
  "deco_center_big",
  "deco_edge_big",
  "deco_edge_small",
  "deco_waist",
  "icon_belt_corner_1",
  "icon_belt_corner_2",
  "icon_belt_grid",
  "icon_pipe_corner_1",
  "icon_pipe_corner_2",
  "icon_pipe_grid",
  "pipe_port_in_1",
  "pipe_port_in_2",
  "pipe_port_in_2_1",
  "pipe_port_in_3",
  "pipe_port_in_3_2",
  "pipe_port_in_4",
  "pipe_port_in_5_2",
  "pipe_port_out_1",
  "pipe_port_out_2",
  "pipe_port_out_2_1",
  "pipe_port_out_3",
  "pipe_port_out_3_2",
  "pipe_port_out_4",
  "pipe_port_out_5_2",
  "port_in_2",
  "port_in_3",
  "port_in_3_2",
  "port_in_4",
  "port_in_5",
  "port_in_5_2",
  "port_in_5_3",
  "port_in_6",
  "port_in_6_4",
  "port_out_2",
  "port_out_3",
  "port_out_3_2",
  "port_out_4",
  "port_out_5",
  "port_out_5_2",
  "port_out_5_3",
  "port_out_6", "port_out_6_4",
  "belt_port_in_1",
  "belt_port_out_1",
  "machine_bg_big_icon",
  "arrow_down",
  "arrow_left",
  "arrow_right",
  "arrow_up",
];

// public/machine_icons/ 下所有 PNG 文件名（不含扩展名作 key）
const MACHINE_ICON_FILES = [
  "base_segment_1",
  "cmpt_mc_1",
  "concealed_pipe_in_1",
  "concealed_pipe_in_muti_1",
  "concealed_pipe_out",
  "concealed_pipe_out_muti_1",
  "dismantler_1",
  "filling_pd_mc_1",
  "furnance_1",
  "gas_disperser_1",
  "gas_reactor_1",
  "gas_tank_1",
  "grinder_1",
  "liquid_cleaner_1",
  "liquid_purifier_1",
  "liquid_tank_1",
  "mix_pool_1",
  "mix_pool_2",
  "phase_trans_1",
  "phase_trans_2",
  "planter_1",
  "power_pile_1",
  "power_sta_1",
  "protocol_core_1",
  "relay_tower",
  "seedcol_1",
  "shaper_1",
  "source_pile_1",
  "storage_box_1",
  "thickener_1",
  "tools_asm_mc_1",
  "warehouse_input_1",
  "warehouse_output_1",
  "winder_1",
  "xiranite_oven_1",
  "xiranite_pylon",
  "xiranite_relay",
];

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

/**
 * 加载 data.json → ResourcesStore（icons / categories / items / recipes）
 */
export async function loadDataConfigs() {
  try {
    const resStore = useResourcesStore();
    const data = await fetchJSON(CONFIG_PATHS.data);

    resStore.setIcons(data.icons || []);
    resStore.setCategories(data.categories || []);
    resStore.setItems(data.items || []);
    resStore.setRecipes(data.recipes || []);

    // 从 data.json items 中提取机器定义
    resStore.setMachinesFromItems(data.items || []);
    // machine ←→ recipe 关联注入
    resStore.injectMachineRecipeIds();

    // 加载 machines_1_4.json 并注入 anchor / mask
    try {
      const machinesConfig = await fetchJSON(CONFIG_PATHS.machine_config);
      // 注入 anchor / mask → ResourcesStore.machines
      resStore.injectMachineAnchorMask(machinesConfig);
      // 注入完整机器定义 → MachineStore.machineTypes
      const machineStore = useMachineStore();
      machineStore.injectFromConfig(machinesConfig, resStore.black_list_machine);
      console.log("[Loader] machines_1_4 config injected");
    } catch (err) {
      console.warn("[Loader] machines_1_4 not found:", err.message);
    }

    console.log(resStore.machines);

    console.log("[Loader] data config loaded");
    return true;
  } catch (err) {
    console.warn("[Loader] data config not found:", err.message);
    return false;
  }
}

/**
 * 加载 icons.webp → PIXI Texture
 */
export async function loadIconSheet() {
  try {
    const url = CONFIG_PATHS.iconsheet;
    console.log("[Loader] loading iconsheet from", url);
    const texture = await Assets.load(url);
    const resStore = useResourcesStore();
    resStore.iconsheetTexture = texture;
    console.log("[Loader] iconsheet loaded, size:", texture.width, "x", texture.height);
    return true;
  } catch (err) {
    console.warn("[Loader] iconsheet not found:", err.message);
    return false;
  }
}

/**
 * 加载 public/textures/ 下所有 PNG → 存入 ResourcesStore.textures
 */
export async function loadTextures() {
  try {
    const resStore = useResourcesStore();
    const entries = await Promise.all(
      TEXTURE_FILES.map((name) =>
        Assets.load(`${BASE}textures/${name}.png`).then((tex) => [name, tex]),
      ),
    );
    const map = Object.fromEntries(entries);
    resStore.setTextures(map);
    console.log(`[Loader] textures loaded (${entries.length} files)`);
    return true;
  } catch (err) {
    console.warn("[Loader] textures not found:", err.message);
    return false;
  }
}

/**
 * 加载 public/machine_icons/ 下所有 PNG → 存入 ResourcesStore.machineIcons
 * key = 文件名(不含扩展名)，如 "furnance_1"
 */
export async function loadMachineIcons() {
  try {
    const resStore = useResourcesStore();
    const entries = await Promise.all(
      MACHINE_ICON_FILES.map((name) =>
        Assets.load(`${BASE}machine_icons/${name}.png`).then((tex) => [name, tex]),
      ),
    );
    const map = Object.fromEntries(entries);
    resStore.setMachineIcons(map);
    console.log(`[Loader] machine icons loaded (${entries.length} files)`);
    return true;
  } catch (err) {
    console.warn("[Loader] machine icons not found:", err.message);
    return false;
  }
}

/**
 * 构建 belt / pipe 的 Sprite 方向索引表
 * 依赖 textures 已加载完毕
 */
export function buildSpriteSheets() {
  const resStore = useResourcesStore();
  const { textures } = resStore;

  // 只存 { texture, rotation } 描述，不生成 Sprite
  function make(tex, rot) {
    return { texture: tex, rotation: rot };
  }

  const beltGrid = textures["icon_belt_grid"];
  const beltC1 = textures["icon_belt_corner_1"];
  const beltC2 = textures["icon_belt_corner_2"];
  const pipeGrid = textures["icon_pipe_grid"];
  const pipeC1 = textures["icon_pipe_corner_1"];
  const pipeC2 = textures["icon_pipe_corner_2"];

  if (!beltGrid || !beltC1 || !beltC2 || !pipeGrid || !pipeC1 || !pipeC2) {
    console.warn(
      "[Loader] belt/pipe textures missing, skip sprite sheet build",
    );
    return false;
  }

  const belt = {};

  // grid (straight) — 基态朝右 "right.right"
  belt["right.right"] = make(beltGrid, 0);
  belt["down.down"] = make(beltGrid, Math.PI / 2);
  belt["left.left"] = make(beltGrid, Math.PI);
  belt["up.up"] = make(beltGrid, -Math.PI / 2);

  // corner_1 (down→right = CCW turn)
  belt["down.right"] = make(beltC1, 0);
  belt["right.up"] = make(beltC1, -Math.PI / 2);
  belt["up.left"] = make(beltC1, Math.PI);
  belt["left.down"] = make(beltC1, Math.PI / 2);

  // corner_2 (left→up = CW turn)
  belt["left.up"] = make(beltC2, 0);
  belt["up.right"] = make(beltC2, Math.PI / 2);
  belt["right.down"] = make(beltC2, Math.PI);
  belt["down.left"] = make(beltC2, -Math.PI / 2);

  const pipe = {};

  pipe["right.right"] = make(pipeGrid, 0);
  pipe["down.down"] = make(pipeGrid, Math.PI / 2);
  pipe["left.left"] = make(pipeGrid, Math.PI);
  pipe["up.up"] = make(pipeGrid, -Math.PI / 2);

  pipe["down.right"] = make(pipeC1, 0);
  pipe["right.up"] = make(pipeC1, -Math.PI / 2);
  pipe["up.left"] = make(pipeC1, Math.PI);
  pipe["left.down"] = make(pipeC1, Math.PI / 2);

  pipe["left.up"] = make(pipeC2, 0);
  pipe["up.right"] = make(pipeC2, Math.PI / 2);
  pipe["right.down"] = make(pipeC2, Math.PI);
  pipe["down.left"] = make(pipeC2, -Math.PI / 2);

  // 特殊节点
  // connector — 旋转不变
  belt["cross.cross"] = make(textures["bg_logistic_log_connector"], 0);
  // splitter — base down→[left,down,right]
  belt["down.left|down|right"] = make(textures["bg_logistic_log_splitter"], 0);
  belt["left.up|left|down"] = make(
    textures["bg_logistic_log_splitter"],
    Math.PI / 2,
  );
  belt["up.right|up|left"] = make(
    textures["bg_logistic_log_splitter"],
    Math.PI,
  );
  belt["right.down|right|up"] = make(
    textures["bg_logistic_log_splitter"],
    -Math.PI / 2,
  );
  // converger — base [down,right,left]→down
  belt["down|right|left.down"] = make(textures["bg_logistic_log_converger"], 0);
  belt["left|down|up.left"] = make(
    textures["bg_logistic_log_converger"],
    Math.PI / 2,
  );
  belt["up|left|right.up"] = make(
    textures["bg_logistic_log_converger"],
    Math.PI,
  );
  belt["right|up|down.right"] = make(
    textures["bg_logistic_log_converger"],
    -Math.PI / 2,
  );

  // pipe 特殊节点
  pipe["cross.cross"] = make(textures["bg_logistic_log_pipe_connector"], 0);
  pipe["down.left|down|right"] = make(
    textures["bg_logistic_log_pipe_splitter"],
    0,
  );
  pipe["left.up|left|down"] = make(
    textures["bg_logistic_log_pipe_splitter"],
    Math.PI / 2,
  );
  pipe["up.right|up|left"] = make(
    textures["bg_logistic_log_pipe_splitter"],
    Math.PI,
  );
  pipe["right.down|right|up"] = make(
    textures["bg_logistic_log_pipe_splitter"],
    -Math.PI / 2,
  );
  pipe["down|right|left.down"] = make(
    textures["bg_logistic_log_pipe_converger"],
    0,
  );
  pipe["left|down|up.left"] = make(
    textures["bg_logistic_log_pipe_converger"],
    Math.PI / 2,
  );
  pipe["up|left|right.up"] = make(
    textures["bg_logistic_log_pipe_converger"],
    Math.PI,
  );
  pipe["right|up|down.right"] = make(
    textures["bg_logistic_log_pipe_converger"],
    -Math.PI / 2,
  );

  // ---- 端口贴图 ----
  const beltPortIn = textures["belt_port_in_1"];
  const beltPortOut = textures["belt_port_out_1"];
  const pipeIn = textures["pipe_port_in_1"];
  const pipeOut = textures["pipe_port_out_1"];

  if (beltPortIn && beltPortOut && pipeIn && pipeOut) {
    const beltPort = {};
    // belt 输出端口，默认朝下
    beltPort["in.down"]  = make(beltPortIn, 0);
    beltPort["in.left"]  = make(beltPortIn,  Math.PI / 2);
    beltPort["in.up"]    = make(beltPortIn,  Math.PI);
    beltPort["in.right"] = make(beltPortIn, -Math.PI / 2);
    // belt 输入端口，默认朝上
    beltPort["out.up"]    = make(beltPortOut, 0);
    beltPort["out.right"] = make(beltPortOut,  Math.PI / 2);
    beltPort["out.down"]  = make(beltPortOut,  Math.PI);
    beltPort["out.left"]  = make(beltPortOut, -Math.PI / 2);

    const pipePort = {};
    // pipe 输入端口，默认朝下
    pipePort["in.down"]  = make(pipeIn, 0);
    pipePort["in.left"]  = make(pipeIn,  Math.PI / 2);
    pipePort["in.up"]    = make(pipeIn,  Math.PI);
    pipePort["in.right"] = make(pipeIn, -Math.PI / 2);
    // pipe 输出端口，默认朝上
    pipePort["out.up"]    = make(pipeOut, 0);
    pipePort["out.right"] = make(pipeOut,  Math.PI / 2);
    pipePort["out.down"]  = make(pipeOut,  Math.PI);
    pipePort["out.left"]  = make(pipeOut, -Math.PI / 2);

    resStore.setPortSheets({ belt: beltPort, pipe: pipePort });
    console.log(`[Loader] port sheets built (belt:${Object.keys(beltPort).length}, pipe:${Object.keys(pipePort).length})`);
  } else {
    console.warn("[Loader] belt/pipe port textures missing, skip port sheet build");
  }

  resStore.setSpriteSheets({ belt, pipe });
  console.log(
    `[Loader] sprite sheets built (belt:${Object.keys(belt).length}, pipe:${Object.keys(pipe).length})`,
  );
  return true;
}

export async function loadAllConfigs() {
  const results = await Promise.allSettled([
    loadDataConfigs(),
    loadIconSheet(),
    loadTextures(),
    loadMachineIcons(),
  ]);
  // textures 加载成功后构建 sprite 表
  buildSpriteSheets();
  return results.every((r) => r.status === "fulfilled");
}
