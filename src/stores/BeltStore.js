import { defineStore } from "pinia";
import { markRaw, ref } from "vue";

export const useBeltStore = defineStore("beltStore", () => {
    const beltTypes = markRaw({
        SPLIT: "split",
        MERGE: "merge",
        CROSS: "cross",
        DEFAULT: "default",
    })

    const nodeTypes = new Set(["split", "merge", "cross"]);

    const nodeDir = markRaw({
        "split": {
            in: "down",
            out: "left|down|right",
        },
        "merge": {
            in: "down|right|left",
            out: "down",
        },
        "cross": {
            in: "cross",
            out: "cross",
        },
    })

    const rotateMap = {
        up: "right",
        down: "left",
        left: "up",
        right: "down",
        cross: "cross",
    }

    return {
        beltTypes,
        rotateMap,
        nodeTypes,
        nodeDir,
    }

  });
