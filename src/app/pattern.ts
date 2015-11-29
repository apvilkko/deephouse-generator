import {randRange} from './util';

function rand(value) {
  return Math.random() < (value / 100.0);
}

function addNote(arr, velocity = 0, note = null) {
  arr.push({velocity: velocity, pitch: note});
}

const BASSNOTES = [3, 5, -2, -5];
const PADNOTES = [-2, 2, -5, 5];

function getBassNote(shift) {
  if (rand(50)) {
    return shift;
  } else {
    return shift + BASSNOTES[randRange(0, BASSNOTES.length - 1)];
  }
}

function getPadNote(shift) {
  if (rand(85)) {
    return shift;
  } else {
    return shift + PADNOTES[randRange(0, PADNOTES.length - 1)];
  }
}

class Pattern {
  constructor() {

  }
  static create() {
    let keyShift = randRange(-5, 6);

    let pattern = {};
    let patternLength = rand(50) ? 16 : 32;
    let arr = [];
    let pitch = randRange(-2, 2);
    for (let i = 0; i < patternLength; ++i) {
      if (i % 4 === 0) {
        addNote(arr, 127, pitch);
      } else if (rand(5)){
        addNote(arr, randRange(10, 110), pitch);
      } else {
        addNote(arr);
      }
    }
    pattern['BD'] = arr;

    patternLength = rand(50) ? 16 : 32
    arr = [];
    pitch = randRange(-2, 2);
    for (let i = 0; i < patternLength; ++i) {
      if ((i + 4) % 8 === 0) {
        addNote(arr, 127, pitch);
      } else if (rand(10) && (i % 4 !== 0)) {
        addNote(arr, randRange(10, 90), pitch);
      } else {
        addNote(arr);
      }
    }
    pattern['CL'] = arr;

    patternLength = rand(50) ? 16 : 32
    arr = [];
    pitch = randRange(-2, 2);
    for (let i = 0; i < patternLength; ++i) {
      if ((i + 2) % 4 === 0) {
        addNote(arr, 127, pitch);
      } else if (rand(5)){
        addNote(arr, randRange(10, 110), pitch);
      } else {
        addNote(arr);
      }
    }
    pattern['HC'] = arr;

    patternLength = rand(50) ? 16 : 32
    arr = [];
    pitch = randRange(-2, 2);
    for (let i = 0; i < patternLength; ++i) {
      if (rand(10) && (i % 4 !== 0)) {
        addNote(arr, randRange(20, 127), pitch);
      } else {
        addNote(arr);
      }
    }
    pattern['PR'] = arr;

    patternLength = rand(75) ? 16 : 32;
    arr = [];
    for (let i = 0; i < patternLength; ++i) {
      if (rand(15)) {
        addNote(arr, randRange(100, 127), getBassNote(keyShift));
      } else {
        addNote(arr);
      }
    }
    pattern['BS'] = arr;

    patternLength = randRange(1,4)*16;
    arr = [];
    for (let i = 0; i < patternLength; ++i) {
      if (rand(10)) {
        addNote(arr, randRange(90, 127), getPadNote(keyShift));
      } else {
        addNote(arr);
      }
    }
    pattern['PD'] = arr;

    return pattern;
  }
}
export default Pattern;
