import { defineStore } from "pinia";
import { PortItemContainer } from "../core_container_sub/PortItemContainer.js";
import { PortRecipeContainer } from "../core_container_sub/PortRecipeContainer.js";
import { markRaw } from "vue";

const DEFAULT_TYPES = {
  testType4: {
    name: "测试机器",
    gridWidth: 5,
    gridHeight: 4,
    anchor: [
      { x: 0.5, y: 0.375 },
      { x: 0.375, y: 0.5 },
    ],
    recipe_id: ["phase_trans_1-liquid_copper"],
    mask: [
      ["bi.down", "bi.down", "bi.down", "bi.down", "bi.down"],
      ["pi.right.pi1", "ma", "ma", "ma", "po.right.po1"],
      ["ma", "ma", "ma", "ma", "ma"],
      ["bo.down", "bo.down", "bo.down", "bo.down", "bo.down"],
    ],
    port_recipe_icon: {
      "pi1": null,
      "po1": null,
    }
  },
};

export const useMachineStore = defineStore("machineStore", () => {
  const machineTypes = markRaw({ ...DEFAULT_TYPES });

  // machineContainerClasses：特殊机器的自定义容器类
  // key = machine.type，value = 继承 MachineContainer 并重写 render 方法的子类
  const machineContainerClasses = markRaw({
    "protocol_core_1": PortItemContainer,
    "phase_trans_1": PortRecipeContainer,
    "phase_trans_2": PortRecipeContainer,
    "gas_reactor_1": PortRecipeContainer,
    "mix_pool_1": PortRecipeContainer,
    "mix_pool_2": PortRecipeContainer,
    "liquid_purifier_1": PortRecipeContainer,
  });

  /**
   * 从外部配置向 machineTypes 注入机器定义（anchor / mask 等）
   * @param {Record<string, object>} configMap - machines_1_4.json 的完整对象
   * @param {string[]} blacklist - 要跳过的机器 key 列表
   */
  function injectFromConfig(configMap, blacklist = []) {
    for (const [key, cfg] of Object.entries(configMap)) {
      if (blacklist.includes(key)) continue;
      machineTypes[key] = cfg;
    }
  }

  /**
   * 注册特殊机器的自定义容器类（继承 MachineContainer 并重写 render 方法）
   * @param {string} type - machine.type
   * @param {typeof import("../core_container_sub/MachineContainer.js").MachineContainer} cls - 容器子类
   */
  function setMachineContainerClass(type, cls) {
    machineContainerClasses[type] = cls;
  }

  return {
    machineTypes,
    machineContainerClasses,
    injectFromConfig,
    setMachineContainerClass,
  };
});
