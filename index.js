
/**
 * Module dependencies.
 */

var fs = require('fs');
var ms = require('ms');

module.exports = Reaper;

function Reaper(opts) {
  opts = opts || {};
  this.threshold = ms(opts.threshold || '1 day');
}

Reaper.prototype.old = function(file, fn){
  var ms = this.threshold;
  fs.stat(file, function(err, s){
    if (err) return fn(err);
    var d = new Date - s.mtime;
    fn(null, d > ms);
  });
};
