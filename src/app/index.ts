import AudioEngine from './audioengine';
import Sequencer from './sequencer';
import {Sample} from './components';
import {InputHandler} from './inputhandler';
import trigger from './event';

var SOUNDS = {
  BD: [
    'MTKickDrum.wav',
    '808kick1.wav',
    '909kick1.wav'
  ],
  CL: [
    '808handclap.wav',
    '909HANDCLP1.WAV',
    'MTHandClap.wav'
  ],
  HC: [
    '808cl_hihat.wav',
    '909cl_hihat.wav',
    'MTHatClosed.wav'
  ]
};

function randRange(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function getRandom(key: string) {
  let arr = SOUNDS[key];
  console.log(arr, randRange(0, arr.length - 1));
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
