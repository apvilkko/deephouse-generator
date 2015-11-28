import trigger from './event';
import {Mapper, maxValue} from './parametermapping';

export class InputHandler {
  sliders: any;

  constructor() {
    this.sliders = {
      'masterGain': {title: ['volume', '']}
    };
    var sliders = document.getElementById('sliders');
    Object.keys(this.sliders).forEach((key) => {
      let value = this.sliders[key];
      value.callback = Mapper.map(key);
      var slider = document.createElement('div');
      slider.setAttribute('class', 'slider');
      var label = document.createElement('label');
      var text = document.createTextNode(value.title[0]);
      label.appendChild(text);
      var input = document.createElement('input');
      input.setAttribute('id', 'slider-' + key);
      input.setAttribute('type', 'range');
      input.setAttribute('min', '0');
      input.setAttribute('max', '' + maxValue);
      label.appendChild(input);
      var text2 = document.createTextNode(value.title[1]);
      label.appendChild(text2);
      slider.appendChild(label);
      sliders.appendChild(slider);
      input.addEventListener('input', value.callback, false);
      var initialValue = value.initial || (maxValue / 2);
      input.value = '' + initialValue;
      value.callback({target: {value: initialValue}});
    });
    var button = document.getElementById('playpause');
    button.addEventListener('click', () => {
      trigger('playpause');
    });
    button = document.getElementById('another');
    button.addEventListener('click', () => {
      trigger('another');
    });
  }
}
