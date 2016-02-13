import trigger from './event';
import {Mapper, maxValue} from './parametermapping';
import config from './config';

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
      var initialValue = value.initial || (maxValue * 0.75);
      input.value = '' + initialValue;
      value.callback({target: {value: initialValue}});
    });
    let button = document.getElementById('playpause');
    button.addEventListener('click', () => {
      trigger('playpause');
    });
    button = document.getElementById('another');
    button.addEventListener('click', () => {
      trigger('another');
    });
    let autoanother = document.getElementById('autoanother');
    autoanother['checked'] = true;
    autoanother.addEventListener('change', (value) => {
      trigger('autoanother', value.target['checked']);
    });
    let autotoggle = document.getElementById('autotoggle');
    autotoggle['checked'] = true;
    autotoggle.addEventListener('change', (value) => {
      trigger('autotoggle', value.target['checked']);
    });

    let trackEl = document.getElementById('tracks');
    config.names.forEach((name) => {
      let button = document.createElement('button');
      button.id = 'track_' + name;
      let text = document.createTextNode(name);
      button.appendChild(text);
      trackEl.appendChild(button);
      button.addEventListener('click', () => {
        let btn = document.getElementById(button.id);
        let muted = btn.className.indexOf('muted') > -1;
        trigger((muted ? 'un' : '') + 'muteTrack', name);
      });
    });

    document.addEventListener('muteTrack', (value: CustomEvent) => {
      let button = document.getElementById('track_' + value.detail);
      button.className = 'muted';
    });
    document.addEventListener('unmuteTrack', (value: CustomEvent) => {
      let button = document.getElementById('track_' + value.detail);
      button.className = '';
    });
  }
}
