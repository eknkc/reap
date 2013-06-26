
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var Batch = require('batch');
var path = require('path');
var resolve = path.resolve;
var fs = require('fs');
var ms = require('ms');

/**
 * Expose `Reaper`.
 */

module.exports = Reaper;

/**
 * Initialize a new `Reaper` with the given `opts`.
 *
 * - `concurrency` stat() concurrency
 * - `threshold` string or number of milliseconds
 *
 * @param {Object} [opts]
 * @api public
 */

function Reaper(opts) {
  opts = opts || {};
  this.dirs = [];
  this.concurrency = opts.concurrency || 10;
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
    fn(null, d > ms, s);
  });
};

Reaper.prototype.watch = function(dir, fn){
  this.dirs.push(dir);
};

Reaper.prototype.start = function(fn){
  var self = this;
  var batch = new Batch;

  batch.concurrency(10);

  this.dirs.forEach(function(dir){
    fs.readdir(dir, function(err, files){
      if (err) return fn(err);
      files.forEach(function(file){
        batch.push(function(done){
          file = resolve(dir, file);
          self.old(file, function(err, old, s){
            if (err) return done(err);
            if (!old) return done();
            fs.unlink(file, function(err){
              s.path = file;
              done(err, s);
            });
          });
        });
      });
    });
  });

  batch.end(fn);
};
