import connectChain from './util';
import {VCA} from './components';

class AudioEngine {
  context: any;
  tracks: any;
  masterGain: VCA;

  constructor() {
    this.context = new (window['AudioContext'] || window['webkitAudioContext'])();
    console.log("AudioEngine context", this.context);
    this.masterGain = new VCA(this.context, 'masterGain', 0.5);
    this.masterGain.connect(this.context.destination);
    this.tracks = {};
  }
  addTrack(key, sound) {
    console.log("addTrack", key, sound);
    var trackGain = new VCA(this.context, key + '_trackGain', 0.5);
    this.tracks[key] = {
      sound: sound,
      gain: trackGain
    };
    connectChain([sound, trackGain, this.masterGain]);
  }
  deleteTrack(key) {
    console.log("deleteTrack", key);
    if (this.tracks[key]) {
      this.tracks[key].sound.disconnect();
      this.tracks[key].gain.disconnect();
      delete this.tracks[key];
    }
  }
}
export default AudioEngine;
