import AudioEngine from './audioengine';
import Sequencer from './sequencer';
import {Sample} from './components';
import {InputHandler} from './inputhandler';
import trigger from './event';
import {randRange} from './util';

var SOUNDS = {
  BD: [
    'bd1', 'bd2', 'bd3', 'bd4'
  ],
  CL: [
    'cl1', 'cl2', 'cl3', 'cl4'
  ],
  HC: [
    'hc1', 'hc2', 'hc3', 'hc4'
  ],
  PR: [
    'pr1', 'pr2', 'pr3', 'pr4'
  ],
  BS: [
    'bass1',
    'bass2',
    'bass3'
  ],
  PD: [
    'pad1',
    'pad2',
    'pad3',
    'pad4'
  ]
};

function getRandom(key: string) {
  let arr = SOUNDS[key];
  return key + '/' + arr[randRange(0, arr.length - 1)];
}

class DeepHouseGenerator {
  audioEngine: AudioEngine;
  sequencer: Sequencer;
  inputHandler: InputHandler;
  sounds: any;

  constructor() {
    this.audioEngine = new AudioEngine();
    this.sounds = {};
    this.createSounds();
    this.sequencer = new Sequencer(this.audioEngine.context, this.sounds);
    this.inputHandler = new InputHandler();
    this.sequencer.start();

    document.addEventListener('another', () => {
      this.createSounds();
      trigger('tempo', randRange(115, 125));
      trigger('shufflePercentage', randRange(0,60));
      this.sequencer.createPattern();
    });
  }

  createSounds() {
    Object.keys(SOUNDS).forEach((key) => {
      if (this.sounds[key]) {
        this.audioEngine.deleteTrack(key);
      }
      this.sounds[key] = new Sample(this.audioEngine.context, key, getRandom(key));
      this.audioEngine.addTrack(key, this.sounds[key]);
    });
  }

}

var app = new DeepHouseGenerator();
