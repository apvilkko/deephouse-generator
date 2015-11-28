export class Component {
  context: any;
  name: string;
  input: any;
  output: any;

  constructor(context, name) {
    this.context = context;
    this.name = name || 'Component';
    console.log("create", this.name);
    this.input = null;
    this.output = null;
  }
  connect(node) {
    console.log('connect', this.name, '=>', node.name ? node.name : node, node);
    if (node.input) {
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  }
  disconnect() {
    console.log("disconnect", this.name);
    if (this.output) {
      this.output.disconnect();
    }
  }
  toString() {
    return this.name;
  }
  addEvent(name, fn) {
    let eventName = this.name + '_' + name;
    console.log("addEvent", eventName);
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
  releaseTime: number;
  min: number;
  max: number;
  param: any;

  constructor(context, name) {
    super(context, name || 'Envelope');
    this.attackTime = 0.05;
    this.releaseTime = 0.4;
    this.addEvent('gateOn', () => { this.trigger(); });
    this.addEvent('gateOff', () => { this.off(); });
    this.addEvent('setRelease', (value) => { this.releaseTime = value.detail; });
    this.addEvent('setMin', (value) => { this.min = value.detail; });
    this.addEvent('setMax', (value) => { this.max = value.detail; });
  }
  trigger() {
    let now = this.context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(this.min, now);
    this.param.linearRampToValueAtTime(this.max, now + this.attackTime);
    this.param.linearRampToValueAtTime(this.min, now + this.attackTime + this.releaseTime);
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
}

export class Sample extends Component {
  source: string;
  buffer: any;
  gain: any;

  constructor(context, name, source) {
    super(context, name || 'Sample');
    this.source = source;
    this.gain = new VCA(context, this.name + '_gain', 0.9);
    this.output = this.gain;
    this.input = this.output;
    this.load();
  }

  load() {
    let request = new XMLHttpRequest();
    request.open('GET', 'samples/' + this.source, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      let audioData = request.response;
      this.context.decodeAudioData(audioData, (buffer) => {
        this.buffer = buffer;
      }, () => {});
    };
    request.send();
  }

  gateOn() {
    if (this.buffer) {
      let bufferSource = this.context.createBufferSource();
      bufferSource.buffer = this.buffer;
      bufferSource.connect(this.gain.input);
      bufferSource.start(0);
    }
  }
}
