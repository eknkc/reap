
var assert = require('assert');
var Reaper = require('..');
var fs = require('fs');

var reaper = new Reaper({
  threshold: 60000
});

function oldFile(file) {
  var min = 60000;
  var old = new Date(new Date - (5 * min));
  fs.writeFileSync(file);
  fs.utimesSync(file, old, old);
}

function newFile(file) {
  var now = new Date;
  fs.writeFileSync(file);
  fs.utimesSync(file, now, now);
}

describe('Reaper#old(file, fn)', function(){
  it('should return true when exceeding the threshold', function(done){
    newFile('/tmp/foo');
    reaper.old('/tmp/foo', function(err, bool){
      if (err) return done(err);
      bool.should.be.false;
      done();
    });
  })

  it('should return false otherwise', function(done){
    oldFile('/tmp/foo');
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
    } catch (err) {
      // ignore
    }

    oldFile('/tmp/reap/tobi');
    oldFile('/tmp/reap/loki');
    oldFile('/tmp/reap/jane');
    newFile('/tmp/reap/manny');
    newFile('/tmp/reap/luna');
  })

  it('should remove old files from the directory', function(done){
    var reaper = new Reaper({ threshold: 60000 });

    reaper.on('remove', function(file){
      assert('string' == typeof file.path);
      assert('number' == typeof file.size);
    });

    reaper.watch('/tmp/reap');

    reaper.start(function(err, files){
      if (err) return done(err);
      files.should.have.length(3);
      assert(!fs.existsSync('/tmp/reap/tobi'));
      assert(!fs.existsSync('/tmp/reap/loki'));
      assert(!fs.existsSync('/tmp/reap/jane'));
      assert(fs.existsSync('/tmp/reap/manny'));
      assert(fs.existsSync('/tmp/reap/luna'));
      done();
    });
  })
})

describe('Reaper#filter(fn)', function() {
  var reaper;
  beforeEach(function() {
    try {
      fs.mkdirSync('/tmp/reap-filter-test', 0755);
    } catch (err) {
      // ignore
    }

    oldFile('/tmp/reap-filter-test/a');
    oldFile('/tmp/reap-filter-test/b');
    oldFile('/tmp/reap-filter-test/c');

    reaper = new Reaper({ threshold: 60000 });
    reaper.watch('/tmp/reap-filter-test');
  })

  it('should reap all files by default', function(done) {
    reaper.start(function(err, files) {
      if (err) return done(err);
      files.should.have.length(3);
      assert(!fs.existsSync('/tmp/reap-filter-test/a'));
      assert(!fs.existsSync('/tmp/reap-filter-test/b'));
      assert(!fs.existsSync('/tmp/reap-filter-test/c'));
      done();
    });
  })

  it('should not reap files that are filtered out', function(done){
    reaper.filter(function(file, fn){
      fn(file.path !== '/tmp/reap-filter-test/b');
    });

    reaper.start(function(err, files) {
      if (err) return done(err);
      files.should.have.length(2);
      assert(!fs.existsSync('/tmp/reap-filter-test/a'));
      assert(fs.existsSync('/tmp/reap-filter-test/b'));
      assert(!fs.existsSync('/tmp/reap-filter-test/c'));
      done();
    });
  })

});
