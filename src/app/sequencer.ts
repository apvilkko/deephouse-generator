import trigger from './event';

const PATTERN = {
  'HC': [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
  //'HO': [0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0],
  'BD': [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  'CL': [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
};

class Sequencer {
  context: any;
  nextNoteTime: number;
  scheduleAheadTime: number;
  currentNote: number;
  noteLength: number;
  secondsPerBeat: number;
  beatsPerBar: number;
  notesPerBeat: number;
  playing: boolean;
  pauseRequested: boolean;
  sounds: any;
  pattern: any;

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
    this.notesPerBeat = Math.round(this.beatsPerBar / this.noteLength);
    this.pattern = PATTERN;
    this.playing = false;
    this.pauseRequested = false;

    document.addEventListener('tempo', (value: CustomEvent) => {
      this.secondsPerBeat = 60.0 / value.detail;
    });
    document.addEventListener('playpause', () => {
      if (this.playing) {
        this.pauseRequested = true;
      } else {
        this.start();
      }
    });
  }
  scheduleNote() {
    Object.keys(this.pattern).forEach((value) => {
      if (this.pattern[value][this.currentNote]) {
        this.sounds[value].gateOn();
        /*if (value === 'HC') {
          trigger('HO_AEnvelope_gateOff');
        }*/
      }
    });
  }
  nextNote() {
    this.nextNoteTime += this.noteLength * this.secondsPerBeat;
    this.currentNote++;
    if (this.currentNote === this.notesPerBeat) {
      this.currentNote = 0;
    }
  }
  start () {
    this.playing = true;
    this.nextNoteTime = this.context.currentTime;
    this.scheduler();
  }
  scheduler() {
    window.requestAnimationFrame(() => {
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
    }
  }
}
export default Sequencer;
