import {randRange, rand} from './util';

function addNote(arr, velocity = 0, note = null) {
  arr.push({velocity: velocity, pitch: note});
  return true;
}

const BASSNOTES = [3, 5, -2, -5];
const PADNOTES = [-2, 2, -5, 5];

function getNote(shift, arr, baseProb) {
  if (rand(baseProb)) {
    return shift;
  } else {
    return shift + arr[randRange(0, arr.length - 1)];
  }
}

function getBassNote(shift) {
  return getNote(shift, BASSNOTES, 50);
}

function getPadNote(shift) {
  return getNote(shift, PADNOTES, 85);
}

function getStabNote(shift) {
  return getNote(shift, PADNOTES, 75);
}

function iteratePattern(patternLength: number, arr, cb) {
  for (let i = 0; i < patternLength; ++i) {
    if (!cb(i)) {
      addNote(arr);
    }
  }
}

class Pattern {
  constructor() {

  }
  static create() {
    let keyShift = randRange(-5, 6);

    /* BD */
    let pattern = {};
    let patternLength = rand(50) ? 16 : 32;
    let arr = [];
    let pitch = randRange(-2, 2);
    iteratePattern(patternLength, arr, (i) => {
      if (i % 4 === 0) {
        return addNote(arr, 127, pitch);
      } else if (rand(5)){
        return addNote(arr, randRange(10, 110), pitch);
      }
    });
    arr = arr.concat(arr);
    patternLength *= 2;
    if (rand(50)) {
      arr[patternLength - randRange(1, 3)] = {velocity: randRange(64, 127), pitch: pitch};
    }
    pattern['BD'] = arr;

    /* CL */
    patternLength = rand(50) ? 16 : 32
    arr = [];
    pitch = randRange(-2, 2);
    iteratePattern(patternLength, arr, (i) => {
      if ((i + 4) % 8 === 0) {
        return addNote(arr, 127, pitch);
      } else if (rand(10) && (i % 4 !== 0)) {
        return addNote(arr, randRange(10, 90), pitch);
      }
    });
    pattern['CL'] = arr;

    /* HC */
    patternLength = rand(50) ? 16 : 32
    arr = [];
    pitch = randRange(-2, 2);
    iteratePattern(patternLength, arr, (i) => {
      if ((i + 2) % 4 === 0) {
        return addNote(arr, 127, pitch);
      } else if (rand(5)){
        return addNote(arr, randRange(10, 110), pitch);
      }
    });
    pattern['HC'] = arr;

    /* PR */
    patternLength = rand(50) ? 16 : 32
    arr = [];
    pitch = randRange(-2, 2);
    iteratePattern(patternLength, arr, (i) => {
      if (rand(10) && (i % 4 !== 0)) {
        return addNote(arr, randRange(20, 127), pitch);
      }
    });
    pattern['PR'] = arr;

    /* BS */
    patternLength = rand(75) ? 16 : 32;
    arr = [];
    iteratePattern(patternLength, arr, (i) => {
      if (rand(15)) {
        return addNote(arr, randRange(100, 127), getBassNote(keyShift));
      }
    });
    pattern['BS'] = arr;

    /* PD */
    patternLength = randRange(2,4)*16;
    arr = [];
    let prevNote = -100;
    iteratePattern(patternLength, arr, (i) => {
      if (rand(7) && (i - prevNote) >= 12) {
        prevNote = i;
        return addNote(arr, randRange(90, 127), getPadNote(keyShift));
      }
    });
    pattern['PD'] = arr;

    /* ST */
    patternLength = randRange(1,4)*16;
    arr = [];
    iteratePattern(patternLength, arr, (i) => {
      if (rand(10)) {
        return addNote(arr, randRange(90, 127), getStabNote(keyShift));
      }
    });
    pattern['ST'] = arr;

    return pattern;
  }
}
export default Pattern;
