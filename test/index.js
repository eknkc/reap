
var Reaper = require('..');
var fs = require('fs');

var reaper = new Reaper({
  threshold: '1 minute'
});

function old(file) {
  var min = 60000;
  var old = new Date(new Date - (5 * min));
  fs.writeFileSync(file);
  fs.utimesSync(file, old, old);
}

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
    old('/tmp/foo');
    reaper.old('/tmp/foo', function(err, bool){
      if (err) return done(err);
      bool.should.be.true;
      done();
    });
  })
})

describe('Reaper#watch(dir)', function(){
  beforeEach(function(){
    try {
      fs.mkdirSync('/tmp/reap', 0755);
      old('/tmp/reap/tobi');
      old('/tmp/reap/loki');
      old('/tmp/reap/jane');
      fs.writeFileSync('/tmp/reap/manny');
      fs.writeFileSync('/tmp/reap/luna');
    } catch (err) {
      // ignore
    }
  })

  it('should remove old files from the directory', function(done){
    var reaper = new Reaper({ threshold: '1m' });

    reaper.on('remove', function(file){
      console.log(file);
    });

    reaper.watch('/tmp/reap');

    reaper.start(function(err, files){
      console.log(files);
    });
  })
})
