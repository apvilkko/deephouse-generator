import AudioEngine from './audioengine';
import Sequencer from './sequencer';
import {Sample} from './components';
import {InputHandler} from './inputhandler';
import trigger from './event';
import {randRange} from './util';
import config from './config';

function getRandom(key: string) {
  let arr = config.sounds[key];
  return key + '/' + arr[randRange(0, arr.length - 1)];
}

function getDelay() {
  var base = randRange(1, 4) / 4;
  var shifter = randRange(97, 103) / 100;
  return base * shifter;
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
      let tempo = randRange(115, 125);
      trigger('tempo', tempo);
      trigger('Delay_setTempo', tempo);
      trigger('Delay_setDelay', getDelay());
      trigger('shufflePercentage', randRange(0,60));
      this.sequencer.createPattern();
    });
  }

  createSounds() {
    config.names.forEach((key) => {
      if (this.sounds[key]) {
        this.audioEngine.deleteTrack(key);
      }
      this.sounds[key] = new Sample(this.audioEngine.context, key, getRandom(key));
      this.audioEngine.addTrack(key, this.sounds[key]);
    });
  }

}

var app = new DeepHouseGenerator();
