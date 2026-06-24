import { useStageStore } from "./StageConfig.js";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useMachineStore = defineStore("machineStore", () => {
    const stageStore = useStageStore();
    
    const machineTypes = ref({
        "testType": {
            width: 3,
            height: 3,
        }
    });

    function getMachineSize(type) {
        return {
            width: machineTypes.value[type].width * stageStore.cellWidth,
            height: machineTypes.value[type].height * stageStore.cellHeight,
        };
    }

    return {
        getMachineSize,
    }
})
