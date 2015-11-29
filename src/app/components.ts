import trigger from './event';

export class Component {
  context: any;
  name: string;
  input: any;
  output: any;

  constructor(context, name) {
    this.context = context;
    this.name = name || 'Component';
    //console.log("create", this.name);
    this.input = null;
    this.output = null;
  }
  connect(node) {
    //console.log('connect', this.name, '=>', node.name ? node.name : node, node);
    if (node.input) {
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  }
  disconnect() {
    //console.log("disconnect", this.name);
    if (this.output) {
      this.output.disconnect();
    }
  }
  toString() {
    return this.name;
  }
  addEvent(name, fn) {
    let eventName = this.name + '_' + name;
    //console.log("addEvent", eventName);
    document.addEventListener(eventName, fn);
  }
}

export class VCA extends Component  {
  gain: GainNode;
  amplitude: any;

  constructor(context, name, initialGain) {
    super(context, name || 'VCA');
    this.gain = context.createGain();
    this.gain.gain.value = initialGain || 0;
    this.input = this.gain;
    this.output = this.gain;
    this.amplitude = this.gain.gain;

    this.addEvent('gain', (value) => {
      this.amplitude.value = value.detail;
    });
  }
}

export class Envelope extends Component {
  attackTime: number;
  decayTime: number;
  releaseTime: number;
  sustainLevel: number;
  min: number;
  max: number;
  param: any;

  constructor(context, name) {
    super(context, name || 'Envelope');
    this.attackTime = 0.001;
    this.releaseTime = 1.0;
    this.decayTime = 1.0;
    this.sustainLevel = 1.0;
    this.addEvent('gateOn', (value) => { this.trigger(value.detail); });
    this.addEvent('gateOff', () => { this.off(); });
    this.addEvent('setRelease', (value) => { this.releaseTime = value.detail; });
    this.addEvent('setMin', (value) => { this.min = value.detail; });
    this.addEvent('setMax', (value) => { this.max = value.detail; });
  }
  trigger(velocity) {
    let now = this.context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(this.min, now);
    let vel = this.max * velocity / 127.0;
    this.param.linearRampToValueAtTime(vel, now + this.attackTime);
    this.param.linearRampToValueAtTime(this.sustainLevel * vel, now + this.attackTime + this.decayTime);
    this.param.linearRampToValueAtTime(this.min, now + this.attackTime + this.decayTime + this.releaseTime);
  }
  off() {
    let now = this.context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(0, now);
  }
  connectEnvelope(node, min, max) {
    this.min = min || 0;
    this.max = max || 1;
    this.param = node;
  }
  connect(node) {
    this.min = 0;
    this.max = 1;
    this.param = node;
  }
}

function getRateFromPitch(pitch) {
  return Math.pow(2, (pitch * 100) / 1200);
}

export class Sample extends Component {
  source: string;
  buffer: any;
  gain: VCA;
  envA: Envelope;

  constructor(context, name, source) {
    super(context, name || 'Sample');
    this.source = source;
    this.gain = new VCA(context, this.name + '_gain', 0.9);
    this.envA = new Envelope(context, this.name + '_AEnvelope');
    this.envA.connect(this.gain.amplitude);
    this.output = this.gain;
    this.input = this.output;
    this.load();
  }

  load() {
    let request = new XMLHttpRequest();
    request.open('GET', 'samples/' + this.source + '.ogg', true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      let audioData = request.response;
      this.context.decodeAudioData(audioData, (buffer) => {
        this.buffer = buffer;
      }, () => {});
    };
    request.send();
  }

  gateOn(note) {
    if (this.buffer) {
      let bufferSource = this.context.createBufferSource();
      bufferSource.buffer = this.buffer;
      bufferSource.connect(this.gain.input);
      bufferSource.start(0);
      if (note.pitch !== null && note.pitch !== 0) {
        bufferSource.playbackRate.value = getRateFromPitch(note.pitch);
      }
      trigger(this.name + '_AEnvelope_gateOn', note.velocity);
    }
  }
}

export class Reverb extends Component {
  convolver: any;
  soundSource: any;

  constructor(context, name = 'Reverb') {
    super(context, name);
    this.convolver = context.createConvolver();
    this.soundSource = context.createBufferSource();
    this.input = this.convolver;
    this.output = this.convolver;
    this.loadImpulse();
  }

  loadImpulse() {
    let request = new XMLHttpRequest();
    request.open('GET', 'samples/impulse/1.ogg', true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      let audioData = request.response;
      this.context.decodeAudioData(audioData, (buffer) => {
        this.soundSource.buffer = buffer;
        this.convolver.buffer = buffer;
      }, () => {});
    };
    request.send();
  }
}
