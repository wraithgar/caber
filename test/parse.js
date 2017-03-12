'use strict';

var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();
var Caber = require('../');

lab.experiment('Main Parse', function () {

  lab.test('README example', function (done) {

    var activities = Caber.parse('Squat 135x5,  200x3, 225x4.\nBench Press 100x9x4\nCycling 1:30:00 15 miles');
    Code.expect(activities).to.have.length(3);
    Code.expect(activities[0].name).to.equal('Squat');
    Code.expect(activities[0].sets).to.have.length(3);
    Code.expect(activities[0].sets[0]).to.include(['unit', 'weight', 'reps']);
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    Code.expect(activities[0].sets[0].unit).to.equal('lb');
    Code.expect(activities[0].sets[0].weight).to.equal(135);
    Code.expect(activities[1].name).to.equal('Bench Press');
    Code.expect(activities[1].sets).to.have.length(4);
    Code.expect(activities[1].sets[0]).to.include(['unit', 'weight', 'reps']);
    Code.expect(activities[1].sets[0].reps).to.equal(9);
    Code.expect(activities[1].sets[0].weight).to.equal(100);
    Code.expect(activities[2].name).to.equal('Cycling');
    Code.expect(activities[2].sets).to.have.length(1);
    Code.expect(activities[2].sets[0].time).to.equal(5400);
    Code.expect(activities[2].sets[0].unit).to.equal('miles');
    Code.expect(activities[2].sets[0].distance).to.equal(15);
    done();
  });

  lab.test('Decimals', function (done) {

    var activities = Caber.parse('Curls 17.5x10');
    Code.expect(activities[0].sets[0].weight).to.equal(17.5);
    done();
  });

  lab.test('Newline separator', function (done) {

    var activities = Caber.parse('Squat 135x5, 200x3\nBench Press 123x10x3');
    Code.expect(activities).to.have.length(2);
    Code.expect(activities[0].name).to.equal('Squat');
    Code.expect(activities[1].name).to.equal('Bench Press');
    done();
  });

  lab.test('Comma separator', function (done) {

    var activities = Caber.parse('Squat 135x5,200x3\nBench Press 123x10x3');
    Code.expect(activities).to.have.length(2);
    Code.expect(activities[0].sets).to.have.length(2);
    Code.expect(activities[0].sets[0].weight).to.equal(135);
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    Code.expect(activities[0].sets[1].weight).to.equal(200);
    Code.expect(activities[0].sets[1].reps).to.equal(3);
    done();
  });

  lab.test('Spaces between weight/reps', function (done) {

    var activities = Caber.parse('Squat 135 x 5');
    Code.expect(activities).to.have.length(1);
    Code.expect(activities[0].name).to.equal('Squat');
    Code.expect(activities[0].sets).to.have.length(1);
    Code.expect(activities[0].sets[0].weight).to.equal(135);
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    activities = Caber.parse('Squat 135x 5');
    Code.expect(activities).to.have.length(1);
    Code.expect(activities[0].name).to.equal('Squat');
    Code.expect(activities[0].sets).to.have.length(1);
    Code.expect(activities[0].sets[0].weight).to.equal(135);
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    activities = Caber.parse('Squat 135 x5');
    Code.expect(activities).to.have.length(1);
    Code.expect(activities[0].name).to.equal('Squat');
    Code.expect(activities[0].sets).to.have.length(1);
    Code.expect(activities[0].sets[0].weight).to.equal(135);
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    done();
  });

  lab.test('Reps no weight', function (done) {

    var activities = Caber.parse('Pull ups 5, 5, 5');
    Code.expect(activities[0].sets).to.have.length(3);
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    Code.expect(activities[0].sets[0].weight).to.be.undefined();
    Code.expect(activities[0].sets[0].unit).to.be.undefined();
    done();
  });

  lab.test('PR star', function (done) {

    var activities = Caber.parse('Deadlift 450x5, 500x1*');
    Code.expect(activities[0].sets[0].pr).to.not.be.true();
    Code.expect(activities[0].sets[1].pr).to.be.true();
    done();
  });

  lab.test('PR on last set only', function (done) {

    var activities = Caber.parse('OHP 185x1x2*');
    Code.expect(activities[0].sets[0].pr).to.not.be.true();
    Code.expect(activities[0].sets[1].pr).to.be.true();
    done();
  });

  lab.test('PR on time/distance', function (done) {

    var activities = Caber.parse('Cycling 1:00 5 miles*');
    Code.expect(activities[0].sets[0].pr).to.be.true();
    Code.expect(activities[0].sets[0].time).to.equal(60);
    Code.expect(activities[0].sets[0].distance).to.equal(5);
    Code.expect(activities[0].sets[0].unit).to.equal('miles');
    done();
  });

  lab.test('Trailing space', function (done) {

    var activities = Caber.parse('Squat 100x5x4 ');
    Code.expect(activities).to.have.length(1);
    Code.expect(activities[0].name).to.equal('Squat');
    Code.expect(activities[0].sets).to.have.length(4);
    done();
  });

  lab.test('Trailing newline', function (done) {

    var activities = Caber.parse('Squat 100x5x4\n');
    Code.expect(activities).to.have.length(1);
    Code.expect(activities[0].name).to.equal('Squat');
    Code.expect(activities[0].sets).to.have.length(4);
    done();
  });

  lab.test('No space on distance', function (done) {

    var activities = Caber.parse('Cycling 3:00 35km');
    Code.expect(activities[0].sets[0].distance).to.equal(35);
    Code.expect(activities[0].sets[0].unit).to.equal('kilometers');
    activities = Caber.parse('Cycling 3:00 35.4mi');
    Code.expect(activities[0].sets[0].distance).to.equal(35.4);
    Code.expect(activities[0].sets[0].unit).to.equal('miles');
    activities = Caber.parse('Cycling 00:30 .5mi');
    Code.expect(activities[0].sets[0].distance).to.equal(0.5);
    Code.expect(activities[0].sets[0].unit).to.equal('miles');
    done();
  });

  lab.test('No double PR switching from weight to distance activity', function (done) {

    var activities = Caber.parse('Squat 255x10x4\nBench 135x4x5*\nCycling 1:00 5 miles');
    Code.expect(activities[1].sets[4].pr).to.be.true();
    Code.expect(activities[2].sets[0].pr).to.not.be.true();
    done();
  });

  lab.test('Comments', function (done) {

    var activities = Caber.parse('Squat 135x5, 200x3 (light leg day)\nBench Press 123x10x3');
    Code.expect(activities).to.have.length(2);
    Code.expect(activities[1].name).to.equal('Bench Press');
    Code.expect(activities[0].comment).to.equal('light leg day');
    activities = Caber.parse('Squat 135x5, 200x3 (sore)\nBench Press 123x10x3');
    Code.expect(activities).to.have.length(2);
    Code.expect(activities[1].name).to.equal('Bench Press');
    Code.expect(activities[0].comment).to.equal('sore');
    activities = Caber.parse('Squat 135x5, 200x3 (comment w number 5 in it)\nBench Press 123x10x3');
    Code.expect(activities).to.have.length(2);
    Code.expect(activities[1].name).to.equal('Bench Press');
    Code.expect(activities[0].comment).to.equal('comment w number 5 in it');
    done();
  });

  lab.test('Zero weight', function (done) {

    var activities = Caber.parse('Pull ups 0x5x5');
    Code.expect(activities[0].sets.length).to.equal(5);
    Code.expect(activities[0].sets[0].weight).to.equal(undefined);
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    done();
  });

  lab.experiment('Natural time units', function () {

    lab.test('Running 30 minutes', function (done) {

      var activities = Caber.parse('Running 30 minutes');
      Code.expect(activities).to.have.length(1);
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets).to.have.length(1);
      Code.expect(activities[0].sets[0].time).to.equal(1800);
      done();
    });

    lab.test('30 min run', function (done) {

      var activities = Caber.parse('30 min run');
      Code.expect(activities).to.have.length(1);
      Code.expect(activities[0].name).to.equal('run');
      Code.expect(activities[0].sets).to.have.length(1);
      Code.expect(activities[0].sets[0].time).to.equal(1800);
      done();
    });

    lab.test('1:00:00 run', function (done) {

      var activities = Caber.parse('1:00:00 run');
      Code.expect(activities).to.have.length(1);
      Code.expect(activities[0].name).to.equal('run');
      Code.expect(activities[0].sets).to.have.length(1);
      Code.expect(activities[0].sets[0].time).to.equal(3600);
      done();
    });

    lab.test('Running 1:00:00 pr', function (done) {

      var activities = Caber.parse('Running 1:00:00*');
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets[0].time).to.equal(1 * 60 * 60);
      Code.expect(activities[0].sets[0].pr).to.equal(true);
      done();
    });

    lab.test('30 min run following rep-only activity', function (done) {

      var activities = Caber.parse('pull up 5\n30 min run');
      Code.expect(activities).to.have.length(2);
      Code.expect(activities[0].name).to.equal('pull up');
      Code.expect(activities[0].sets).to.have.length(1);
      Code.expect(activities[1].name).to.equal('run');
      Code.expect(activities[1].sets[0].time).to.equal(1800);
      done();
    });

    lab.test('time on new line', function (done) {

      var activities = Caber.parse('Running\n5 hours');
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets[0].time).to.equal(5 * 60 * 60);
      done();
    });

    lab.test('time and distance', function (done) {

      var activities = Caber.parse('Running 5 hours 1 mile');
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets[0].time).to.equal(5 * 60 * 60);
      Code.expect(activities[0].sets[0].distance).to.equal(1);
      Code.expect(activities[0].sets[0].unit).to.equal('miles');
      done();
    });

    lab.test('time:00 and distance', function (done) {

      var activities = Caber.parse('Running 5:00:00 1 mile');
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets[0].time).to.equal(5 * 60 * 60);
      Code.expect(activities[0].sets[0].distance).to.equal(1);
      Code.expect(activities[0].sets[0].unit).to.equal('miles');
      done();
    });

    lab.test('distance and time', function (done) {

      var activities = Caber.parse('Running 5 miles 1 hour');
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets[0].time).to.equal(1 * 60 * 60);
      Code.expect(activities[0].sets[0].distance).to.equal(5);
      Code.expect(activities[0].sets[0].unit).to.equal('miles');
      done();
    });

    lab.test('distance and time:00', function (done) {

      var activities = Caber.parse('Running 5 miles 1:00:00');
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets[0].time).to.equal(1 * 60 * 60);
      Code.expect(activities[0].sets[0].distance).to.equal(5);
      Code.expect(activities[0].sets[0].unit).to.equal('miles');
      done();
    });


    lab.test('time first', function (done) {

      var activities = Caber.parse('5 hour run');
      Code.expect(activities[0].name).to.equal('run');
      Code.expect(activities[0].sets[0].time).to.equal(5 * 60 * 60);
      done();
    });

    lab.test('Running 5 hours pr', function (done) {

      var activities = Caber.parse('Running 5 hours*');
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets[0].time).to.equal(5 * 60 * 60);
      Code.expect(activities[0].sets[0].pr).to.equal(true);
      done();
    });

    lab.test('multiple time units', function (done) {

      var activities = Caber.parse('Running\n5 hours\n5 hours');
      Code.expect(activities[0].name).to.equal('Running');
      Code.expect(activities[0].sets.length).to.equal(2);
      done();
    });

  });

  lab.test('Long name', function (done) {

    var activities = Caber.parse('Pull up bar with knurls 5,5,5');
    Code.expect(activities[0].name).to.equal('Pull up bar with knurls');
    done();
  });

  lab.test('no spaces with unit', function (done) {

    var activities = Caber.parse('Squats 5kgx5');
    Code.expect(activities[0].name).to.equal('Squats');
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    Code.expect(activities[0].sets[0].weight).to.equal(5);
    Code.expect(activities[0].sets[0].unit).to.equal('kg');
    done();
  });

  lab.test('weird spaces with unit', function (done) {

    var activities = Caber.parse('Squats 5 kgx5');
    Code.expect(activities[0].name).to.equal('Squats');
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    Code.expect(activities[0].sets[0].weight).to.equal(5);
    Code.expect(activities[0].sets[0].unit).to.equal('kg');
    done();
  });

  lab.test('negative numbers', function (done) {

    var activities = Caber.parse('Pull ups -55x5');
    Code.expect(activities[0].name).to.equal('Pull ups');
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    Code.expect(activities[0].sets[0].weight).to.equal(-55);
    Code.expect(activities[0].sets[0].unit).to.equal('lb');
    done();
  });

  lab.test('negative numbers on new line', function (done) {

    var activities = Caber.parse('Pull ups\n-55x5');
    Code.expect(activities[0].name).to.equal('Pull ups');
    Code.expect(activities[0].sets[0].reps).to.equal(5);
    Code.expect(activities[0].sets[0].weight).to.equal(-55);
    Code.expect(activities[0].sets[0].unit).to.equal('lb');
    done();
  });

  lab.test('defined units', function (done) {

    var lbactivities = Caber.parse('Bench 135lb x 5');
    var kgactivities = Caber.parse('Bench 135kg x 5');
    Code.expect(lbactivities[0].name).to.equal('Bench');
    Code.expect(lbactivities[0].sets[0].unit).to.equal('lb');
    Code.expect(lbactivities[0].sets[0].weight).to.equal(135);
    Code.expect(kgactivities[0].name).to.equal('Bench');
    Code.expect(kgactivities[0].sets[0].unit).to.equal('kg');
    Code.expect(kgactivities[0].sets[0].weight).to.equal(135);
    done();
  });

  lab.test('default units', function (done) {

    var activities = Caber.parse('Bench 135x5', 'kg');
    Code.expect(activities[0].name).to.equal('Bench');
    Code.expect(activities[0].sets[0].unit).to.equal('kg');
    Code.expect(activities[0].sets[0].weight).to.equal(135);
    done();
  });

  lab.test('invalid unit', function (done) {

    Code.expect(function () {

      Caber.parse('Bench 135x5', 'x');
    }).to.throw(TypeError);
    done();
  });
});