export function connectChain(chain) {
  for (let i = 0; i < chain.length - 1; ++i) {
    chain[i].connect(chain[i+1]);
  }
}

export function randRange(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function rand(value) {
  return Math.random() < (value / 100.0);
}

export function sample(arr, size) {
  var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

export default connectChain;
