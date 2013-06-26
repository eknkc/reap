
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var fs = require('fs');
var ms = require('ms');

/**
 * Expose `Reaper`.
 */

module.exports = Reaper;

/**
 * Initialize a new `Reaper` with the given `opts`.
 *
 * - `threshold` string or number of milliseconds
 *
 * @param {Object} [opts]
 * @api public
 */

function Reaper(opts) {
  opts = opts || {};
  this.threshold = ms(opts.threshold || '1 day');
}

/**
 * Inherit from `Emitter.prototype`.
 */

Reaper.prototype.__proto__ = Emitter.prototype;

/**
 * Check if `file` is old.
 *
 * @param {String} file
 * @param {Function} fn
 * @api public
 */

Reaper.prototype.old = function(file, fn){
  var ms = this.threshold;
  fs.stat(file, function(err, s){
    if (err) return fn(err);
    var d = new Date - s.mtime;
    fn(null, d > ms);
  });
};
