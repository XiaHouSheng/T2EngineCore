import { pipeRootContainer } from "../core_stage/SimStage.js";
import { PipeContainer } from "../core_container_sub/PipeContainer.js";
function drawPipe(Pipe) {
    const pipeContainer = new PipeContainer(Pipe);
    pipeRootContainer.addChild(pipeContainer);
    return pipeContainer;
}

function dropDrawPipe(pipe_container) {
    pipeRootContainer.removeChild(pipe_container);
}

export { drawPipe, dropDrawPipe };  
