import trigger from './event';

export const maxValue = 255;

function scale(value, min = null, max = null) {
  min = (!min && min !== 0) ? 0 : min;
  max = (!max && max !== 0) ? 1 : max;
  return (parseInt(value.target.value, 10) / maxValue) * (max - min) + min;
}

function doTrigger(paramName) {
  return function (event) {
    trigger(paramName, scale(event));
  }
}

let parameters = {
  masterGain: doTrigger('masterGain_gain')
};

export class Mapper {
  static map(key) {
    return parameters[key];
  }
}
