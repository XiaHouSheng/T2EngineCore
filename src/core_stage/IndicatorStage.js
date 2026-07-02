import { indicatorContainer } from "./SimStage";
import { IndicatorGraphic } from "../core_graphic/IndicatorGraphic.js";

//一个Cube的遮罩指示
function drawMask(position) {
  const mask = new IndicatorGraphic(position);
  indicatorContainer.addChild(mask);
  return mask;
}

//指定长宽的遮罩指示
function drawSpecialMask(position, size, pivot) {
  const mask = new IndicatorGraphic(position, size, pivot);
  indicatorContainer.addChild(mask);
  return mask;
}

//批量cube的遮罩指示
function drawBatchMask(positions) {
  positions.forEach((position) => {
    drawMask(position);
  });
}

//从位置到位置的遮罩指示
function drawMaskFromPosition(
  start_position,
  end_position,
  change_mode = true,
) {
  const { startX, startY } = start_position;
  const { endX, endY } = end_position;
  const masks = [];
  
  if (startX === endX && startY === endY) {
    return masks; 
  }

  if (startX === endX) {
    const delta_num = startY - endY;
    for (let i = 0; i < Math.abs(delta_num) + 1; i++) {
      let pre_i = delta_num > 0 ? -i : i;
      const mask = drawMask({ gridX: startX, gridY: startY + pre_i });
      masks.push(mask);
    }
    return masks; 
  }

  if (startY === endY) {
    const delta_num = startX - endX;
    for (let i = 0; i < Math.abs(delta_num) + 1; i++) {
      let pre_i = delta_num > 0 ? -i : i;
      const mask = drawMask({ gridX: startX + pre_i, gridY: startY });
      masks.push(mask);
    }
    return masks; 
  }

  const crossX = change_mode ? startX : endX;
  const crossY = change_mode ? endY : startY;

  let delta_num;
  //start -> cross
  delta_num = change_mode ? startY - crossY : startX - crossX;
  //place start -> cross
  for (let i = 0; i < Math.abs(delta_num); i++) {
    let next_x, next_y;
    if (change_mode) {
      next_x = startX;
      next_y = delta_num > 0 ? startY - i : startY + i;
    } else {
      next_x = delta_num > 0 ? startX - i : startX + i;
      next_y = startY;
    }
    const mask = drawMask({ gridX: next_x, gridY: next_y });
    masks.push(mask);
  }
  //cross -> end
  delta_num = change_mode ? crossX - endX : crossY - endY;
  //place cross mask
  masks.push(drawMask({ gridX: crossX, gridY: crossY }));
  //place cross -> end
  for (let i = 1; i < Math.abs(delta_num) + 1; i++) {
    let next_x, next_y;
    if (change_mode) {
      next_x = delta_num > 0 ? crossX - i : crossX + i;
      next_y = crossY;
    } else {
      next_x = crossX;
      next_y = delta_num > 0 ? crossY - i : crossY + i;
    }
    const mask = drawMask({ gridX: next_x, gridY: next_y });
    masks.push(mask);
  }
  return masks; 
}

//画框选框
function drawSelectBox() {
  
}

export { drawMask, drawSpecialMask, drawBatchMask, drawMaskFromPosition };
