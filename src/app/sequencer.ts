import trigger from './event';
import Pattern from './pattern';

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

  constructor(context, sounds) {
    this.context = context;
    this.sounds = sounds;
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
    this.autoanother = false;
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
    /*document.addEventListener('visibilitychange', () => {
      if (this.playing) {
        this.pauseRequested = true;
      }
    }, false);*/
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
        /*if (value === 'HC') {
          trigger('HO_AEnvelope_gateOff');
        }*/
      }
    });
  }
  nextNote() {
    let shuffleAmount = 1.0 - this.shufflePercentage * 2 / 3.0 / 100.0;
    let noteLen = ((this.currentNote % 2) ? shuffleAmount : (2.0 - shuffleAmount)) * this.noteLength;
    this.nextNoteTime += noteLen * this.secondsPerBeat;
    this.currentNote++;
    if (this.currentNote === 256) {
      this.currentNote = 0;
    }
    if (this.autoanother && this.currentNote % 128 === 0) {
      trigger('another');
    }
  }
  start () {
    this.playing = true;
    this.nextNoteTime = this.context.currentTime;
    this.scheduler();
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
  scheduler() {
    /*window.requestAnimationFrame(() => {
      if (this.pauseRequested) {
        this.playing = false;
        this.pauseRequested = false;
        return;
      }
      this.scheduler();
    });
    if (this.nextNoteTime < this.context.currentTime + this.scheduleAheadTime ) {
      this.scheduleNote();
      this.nextNote();
    }*/
  }
}
export default Sequencer;
