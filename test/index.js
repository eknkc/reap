
var Reaper = require('..');
var fs = require('fs');

var reaper = new Reaper({
  threshold: '1 minute'
});

describe('Reaper#old(file, fn)', function(){
  it('should return true when exceeding the threshold', function(done){
    fs.writeFileSync('/tmp/foo');

    reaper.old('/tmp/foo', function(err, bool){
      if (err) return done(err);
      bool.should.be.false;
      done();
    });
  })

  it('should return false otherwise', function(done){
    var min = 60000;
    var old = new Date(new Date - (5 * min));
    fs.writeFileSync('/tmp/foo');
    fs.utimesSync('/tmp/foo', old, old);

    reaper.old('/tmp/foo', function(err, bool){
      if (err) return done(err);
      bool.should.be.true;
      done();
    });
  })
})
