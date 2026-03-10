// Suppress stockfish.js's own auto-init (it detects worker via `onmessage` + no window)
// by pre-defining window so that code path is skipped.
// We then call the exported factory ourselves with full control.
self.window   = { document: true };
self.module   = { exports: {} };
self.exports  = self.module.exports;

importScripts('/stockfish.js');

// After importScripts, module.exports is the Stockfish factory function.
var Stockfish = self.module.exports;

Stockfish({
  locateFile: function (path) {
    // Make sure WASM is fetched from the correct location
    if (path.indexOf('.wasm') !== -1 && path.indexOf('.map') === -1) {
      return '/stockfish.wasm';
    }
    return path;
  },
  listener: function (line) {
    // Forward every engine output line to the main thread
    postMessage(line);
  }
}).then(function (sf) {
  // Engine is ready — send UCI handshake
  sf.postMessage('uci');
  sf.postMessage('isready');

  // Receive commands from the main thread and forward to engine
  self.onmessage = function (e) {
    sf.postMessage(e.data);
  };

}).catch(function (err) {
  postMessage('INIT_ERROR: ' + (err && err.message ? err.message : err));
});
