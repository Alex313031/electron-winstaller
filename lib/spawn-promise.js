"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = spawn;
var _child_process = require("child_process");
var d = require('debug')('electron-windows-installer:spawn');

// Public: Maps a process's output into an {Observable}
//
// exe - The program to execute
// params - Arguments passed to the process
// opts - Options that will be passed to child_process.spawn
//
// Returns an {Observable} with a single value, that is the output of the
// spawned process
function spawn(exe, params) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  return new Promise(function (resolve, reject) {
    var proc = null;
    d("Spawning ".concat(exe, " ").concat(params.join(' ')));
    if (!opts) {
      proc = (0, _child_process.spawn)(exe, params);
    } else {
      proc = (0, _child_process.spawn)(exe, params, opts);
    }

    // We need to wait until all three events have happened:
    // * stdout's pipe is closed
    // * stderr's pipe is closed
    // * We've got an exit code
    var rejected = false;
    var refCount = 3;
    var release = function release() {
      if (--refCount <= 0 && !rejected) resolve(stdout);
    };
    var stdout = '';
    var bufHandler = function bufHandler(b) {
      var chunk = b.toString();
      stdout += chunk;
    };
    proc.stdout.on('data', bufHandler);
    proc.stdout.once('close', release);
    proc.stderr.on('data', bufHandler);
    proc.stderr.once('close', release);
    proc.on('error', function (e) {
      return reject(e);
    });
    proc.on('close', function (code) {
      if (code === 0) {
        release();
      } else {
        rejected = true;
        reject(new Error("Failed with exit code: ".concat(code, "\nOutput:\n").concat(stdout)));
      }
    });
  });
}