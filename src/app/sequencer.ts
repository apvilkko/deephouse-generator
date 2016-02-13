import trigger from './event';
import Pattern from './pattern';
import {rand, sample, randRange} from './util';
import config from './config';

class Sequencer {
  context: any;
  nextNoteTime: number;
  scheduleAheadTime: number;
  currentNote: number;
  noteLength: number;
  secondsPerBeat: number;
  beatsPerBar: number;
  playing: boolean;
  pauseRequested: boolean;
  sounds: any;
  pattern: any;
  shufflePercentage: number;
  worker: any;
  autoanother: boolean;
  autotoggle: boolean;
  toggleState: any;
  tracks: any;

  constructor(context, sounds) {
    this.context = context;
    this.sounds = sounds;
    this.toggleState = {tracks: {}, duration: 0};
    config.names.map(i => this.toggleState.tracks[i] = true);
    this.nextNoteTime = context.currentTime;
    this.scheduleAheadTime = 0.1;
    this.currentNote = 0;
    this.noteLength = 0.25; // (1 = quarter note, 0.5 = eighth note)
    let tempo = 120;
    this.secondsPerBeat = 60.0 / tempo;
    this.beatsPerBar = 4;
    this.playing = false;
    this.pauseRequested = false;
    this.shufflePercentage = 0;
    this.autoanother = true;
    this.autotoggle = true;
    this.createPattern();

    this.worker = new Worker('dist/worker.js');
    this.worker.postMessage('start');
    this.worker.onmessage = () => {
      this.onTick();
    };

    document.addEventListener('tempo', (value: CustomEvent) => {
      this.secondsPerBeat = 60.0 / value.detail;
    });
    document.addEventListener('shufflePercentage', (value: CustomEvent) => {
      this.shufflePercentage = value.detail;
    });
    document.addEventListener('playpause', () => {
      this.playpause();
    });
    document.addEventListener('autoanother', (value: CustomEvent) => {
      this.autoanother = value.detail;
    });
    document.addEventListener('autotoggle', (value: CustomEvent) => {
      this.autotoggle = value.detail;
    });
  }
  playpause() {
    if (this.playing) {
      this.pauseRequested = true;
    } else {
      this.start();
    }
  }
  createPattern() {
    this.pattern = Pattern.create();
  }
  scheduleNote() {
    Object.keys(this.pattern).forEach((key) => {
      let track = this.pattern[key];
      let note = track[this.currentNote % track.length];
      if (note.velocity) {
        this.sounds[key].gateOn(note);
      }
    });
  }
  shouldChange(dist, prob) {
    return this.currentNote % 16 === 0 && this.toggleState.duration >= dist && rand(prob);
  }
  nextNote() {
    let shuffleAmount = 1.0 - this.shufflePercentage * 2 / 3.0 / 100.0;
    let noteLen = ((this.currentNote % 2) ? shuffleAmount : (2.0 - shuffleAmount)) * this.noteLength;
    this.nextNoteTime += noteLen * this.secondsPerBeat;
    this.currentNote++;
    if (this.currentNote === (256 + 128)) {
      this.currentNote = 0;
      if (this.autoanother) {
        trigger('another');
      }
    }
    if (this.autotoggle) {
      this.toggleState.duration++;
      if (this.toggleState.in) {
        if (this.shouldChange(16, 40)) {
          this.toggleState.in = false;
          this.toggleState.duration = 0;
          config.names.forEach(i => {
            this.toggleState.tracks[i] = true;
            trigger('unmuteTrack', i);
          });
        }
      } else {
        if (this.shouldChange(64, 40)) {
          this.toggleState.in = true;
          this.toggleState.duration = 0;
          let muted = sample(config.names, randRange(1,4));
          muted.forEach(i => {
            this.toggleState.tracks[i] = false;
            trigger('muteTrack', i);
          });
        }
      }
    }
  }
  start () {
    this.playing = true;
    this.nextNoteTime = this.context.currentTime;
  }
  onTick() {
    if (this.pauseRequested) {
      this.playing = false;
      this.pauseRequested = false;
      return;
    }
    if (this.playing) {
      if (this.nextNoteTime < this.context.currentTime + this.scheduleAheadTime ) {
        this.scheduleNote();
        this.nextNote();
      }
    }
  }
}
export default Sequencer;
