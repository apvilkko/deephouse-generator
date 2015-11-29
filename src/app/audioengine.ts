import connectChain from './util';
import {VCA, Reverb} from './components';

class AudioEngine {
  context: any;
  tracks: any;
  masterGain: VCA;

  constructor() {
    this.context = new (window['AudioContext'] || window['webkitAudioContext'])();
    //console.log("AudioEngine context", this.context);
    this.masterGain = new VCA(this.context, 'masterGain', 0.5);
    this.masterGain.connect(this.context.destination);
    this.tracks = {};
  }
  addTrack(key, sound) {
    //console.log("addTrack", key, sound);
    let gains = {
      BD: 0.55,
      CL: 0.4,
      BS: 0.55,
      PD: 0.30,
      HC: 0.4,
      PR: 0.45,
    }
    var trackGain = new VCA(this.context, key + '_trackGain', gains[key]);
    this.tracks[key] = {
      sound: sound,
      gain: trackGain
    };
    if (key === 'PD') {
      this.tracks[key].reverb = new Reverb(this.context);
      connectChain([trackGain, this.tracks[key].reverb, this.masterGain]);
    }
    connectChain([sound, trackGain, this.masterGain]);
  }
  deleteTrack(key) {
    //console.log("deleteTrack", key);
    if (this.tracks[key]) {
      this.tracks[key].sound.disconnect();
      this.tracks[key].gain.disconnect();
      delete this.tracks[key];
    }
  }
}
export default AudioEngine;
