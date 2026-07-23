import { defineStore } from "pinia";
import { markRaw, ref } from "vue";

export const usePipeStore = defineStore("pipeStore", () => {
    const pipeTypes = markRaw({
        SPLIT: "split",
        MERGE: "merge",
        CROSS: "cross",
        DEFAULT: "default",
    })

    const directions = markRaw({
        UP: "up",
        RIGHT: "right",
        DOWN: "down",
        LEFT: "left",
    })

    const nodeTypes = new Set(["split", "merge", "cross"]);

    const nodeDir = markRaw({
        "split": {
            in: "down",
            out: "left|right|down",
        },
        "merge": {
            in: "down|left|right",
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
        pipeTypes,
        directions,
        nodeTypes,
        nodeDir,
        rotateMap,
    }

  });
