import { useMachineStore } from "../stores/MachineStore.js";

const BASE = import.meta.env.BASE_URL; // 适配 Vite base 路径

const CONFIG_PATHS = {
  machines: `${BASE}configs/machines.json`,
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

export async function loadMachineConfigs() {
  try {
    const machineStore = useMachineStore();
    const data = await fetchJSON(CONFIG_PATHS.machines);
    machineStore.setMachineTypes(data);
    console.log(`[Loader] machines config loaded (${Object.keys(data).length} types)`);
    return true;
  } catch (err) {
    console.warn("[Loader] machines config not found, using defaults:", err.message);
    return false;
  }
}

export async function loadAllConfigs() {
  const results = await Promise.allSettled([
    loadMachineConfigs(),
  ]);
  return results.every((r) => r.status === "fulfilled");
}
