import connectChain from './util';
import {VCA, Reverb, Delay} from './components';
import trigger from './event';
import config from './config';

class AudioEngine {
  context: any;
  tracks: any;
  masterGain: VCA;
  delay: Delay;
  feedback: VCA;
  delayGain: VCA;
  gains: any;

  constructor() {
    this.context = new (window['AudioContext'] || window['webkitAudioContext'])();
    //console.log("AudioEngine context", this.context);
    this.masterGain = new VCA(this.context, 'masterGain', 0.5);
    this.masterGain.connect(this.context.destination);
    this.delay = new Delay(this.context);
    this.feedback = new VCA(this.context, 'delayFeedback', 0.3);
    this.delayGain = new VCA(this.context, 'delayGain', 0.22);
    connectChain([this.delay, this.feedback, this.delay, this.delayGain, this.masterGain]);
    this.tracks = {};

    document.addEventListener('muteTrack', (value: CustomEvent) => { this.muteTrack(value.detail); });
    document.addEventListener('unmuteTrack', (value: CustomEvent) => { this.unmuteTrack(value.detail); });
  }
  muteTrack(name) {
    //console.log("mute", name);
    trigger(name + '_trackGain_gain', 0);
  }
  unmuteTrack(name) {
    //console.log("unmute", name);
    trigger(name + '_trackGain_gain', config.gains[name]);
  }
  addTrack(key, sound) {
    //console.log("addTrack", key, sound);
    var trackGain = new VCA(this.context, key + '_trackGain', config.gains[key]);
    this.tracks[key] = {
      sound: sound,
      gain: trackGain
    };
    if (key === 'PD') {
      this.tracks[key].reverb = new Reverb(this.context);
      connectChain([trackGain, this.tracks[key].reverb, this.masterGain]);
    }
    if (key === 'ST') {
      connectChain([trackGain, this.delay]);
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
