import { beltRootContainer } from "../core_stage/SimStage.js";
import { BeltContainer } from "../core_container_sub/BeltContainer.js";
function drawBelt(belt) {
    const beltContainer = new BeltContainer(belt);
    beltRootContainer.addChild(beltContainer);
    return beltContainer;
}

function dropDrawBelt(belt_container) {
    beltRootContainer.removeChild(belt_container);
}

export { drawBelt, dropDrawBelt };