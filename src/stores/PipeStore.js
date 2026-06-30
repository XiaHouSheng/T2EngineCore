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

    const rotateMap = {
        up: "right",
        down: "left",
        left: "up",
        right: "down",
    }

    return {
        pipeTypes,
        directions,
        rotateMap,
    }

  });
