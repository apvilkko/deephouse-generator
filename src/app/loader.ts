var samples = {};

function doRequest(name, url, cb) {
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    samples[name] = request.response;
    cb(samples[name]);
  };
  request.send();
}

export default function loadSample(name, cb) {
  if (!samples[name]) {
    let url = `samples/${name}.ogg`;
    return doRequest(name, url, cb);
  }
  cb(samples[name]);
}
