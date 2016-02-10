onmessage = function(e) {
  setInterval(function() {
    postMessage(true);
  }, 20);
};
