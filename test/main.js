var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();
var caber = require('../');

lab.experiment('Main Parse', function () {

    lab.test('README example', function (done) {
        var workout = caber.parse('Squat 135x5,  200x3, 225x4. Bench Press 100x9x4 Cycling 1:30:00 15 miles');
        Code.expect(workout).to.have.length(3);
        Code.expect(workout[0].name).to.equal('Squat');
        Code.expect(workout[0].sets).to.have.length(3);
        Code.expect(workout[0].sets[0]).to.include('unit', 'weight', 'reps');
        Code.expect(workout[0].sets[0].reps).to.equal(5);
        Code.expect(workout[0].sets[0].unit).to.equal('lb');
        Code.expect(workout[0].sets[0].weight).to.equal(135);
        Code.expect(workout[1].name).to.equal('Bench Press');
        Code.expect(workout[1].sets).to.have.length(4);
        Code.expect(workout[1].sets[0]).to.include('unit', 'weight', 'reps');
        Code.expect(workout[1].sets[0].reps).to.equal(9);
        Code.expect(workout[1].sets[0].weight).to.equal(100);
        Code.expect(workout[2].name).to.equal('Cycling');
        Code.expect(workout[2].sets).to.have.length(1);
        Code.expect(workout[2].sets[0].time).to.equal(5400);
        Code.expect(workout[2].sets[0].unit).to.equal('miles');
        Code.expect(workout[2].sets[0].distance).to.equal(15);
        done();
    });

    lab.test('Decimals', function (done) {
        var workout = caber.parse('Curls 17.5x10');
        Code.expect(workout[0].sets[0].weight).to.equal(17.5);
        done();
    });

    lab.test('Newline separator', function (done) {
        var workout = caber.parse('Squat 135x5, 200x3\nBench Press 123x10x3');
        Code.expect(workout).to.have.length(2);
        Code.expect(workout[0].name).to.equal('Squat');
        Code.expect(workout[1].name).to.equal('Bench Press');
        done();
    });

    lab.test('Comma separator', function (done) {
        var workout = caber.parse('Squat 135x5,200x3 Bench Press 123x10x3');
        Code.expect(workout).to.have.length(2);
        Code.expect(workout[0].sets).to.have.length(2);
        Code.expect(workout[0].sets[0].weight).to.equal(135);
        Code.expect(workout[0].sets[0].reps).to.equal(5);
        Code.expect(workout[0].sets[1].weight).to.equal(200);
        Code.expect(workout[0].sets[1].reps).to.equal(3);
        done();
    });

    lab.test('Spaces between weight/reps', function (done) {
        var workout = caber.parse('Squat 135 x 5');
        Code.expect(workout).to.have.length(1);
        Code.expect(workout[0].name).to.equal('Squat');
        Code.expect(workout[0].sets).to.have.length(1);
        Code.expect(workout[0].sets[0].weight).to.equal(135);
        Code.expect(workout[0].sets[0].reps).to.equal(5);
        workout = caber.parse('Squat 135x 5');
        Code.expect(workout).to.have.length(1);
        Code.expect(workout[0].name).to.equal('Squat');
        Code.expect(workout[0].sets).to.have.length(1);
        Code.expect(workout[0].sets[0].weight).to.equal(135);
        Code.expect(workout[0].sets[0].reps).to.equal(5);
        workout = caber.parse('Squat 135 x5');
        Code.expect(workout).to.have.length(1);
        Code.expect(workout[0].name).to.equal('Squat');
        Code.expect(workout[0].sets).to.have.length(1);
        Code.expect(workout[0].sets[0].weight).to.equal(135);
        Code.expect(workout[0].sets[0].reps).to.equal(5);
        done();
    });

    lab.test('Reps no weight', function (done) {
        var workout = caber.parse('Pull ups 5, 5, 5');
        Code.expect(workout[0].sets).to.have.length(3);
        Code.expect(workout[0].sets[0].reps).to.equal(5);
        Code.expect(workout[0].sets[0].weight).to.be.undefined();
        Code.expect(workout[0].sets[0].unit).to.be.undefined();
        done();
    });

    lab.test('PR star', function (done) {
        var workout = caber.parse('Deadlift 450x5, 500x1*');
        Code.expect(workout[0].sets[0].pr).to.not.be.true();
        Code.expect(workout[0].sets[1].pr).to.be.true();
        done();
    });

    lab.test('PR on last set only', function (done) {
        var workout = caber.parse('OHP 185x1x2*');
        Code.expect(workout[0].sets[0].pr).to.not.be.true();
        Code.expect(workout[0].sets[1].pr).to.be.true();
        done();
    });

    lab.test('PR on time/distance', function (done) {
        var workout = caber.parse('Cycling 1:00 5 miles*');
        Code.expect(workout[0].sets[0].pr).to.be.true();
        Code.expect(workout[0].sets[0].time).to.equal(60);
        Code.expect(workout[0].sets[0].distance).to.equal(5);
        Code.expect(workout[0].sets[0].unit).to.equal('miles');
        done();
    });

    lab.test('Trailing space', function (done) {
        var workout = caber.parse('Squat 100x5x4 ');
        Code.expect(workout).to.have.length(1);
        Code.expect(workout[0].sets).to.have.length(4);
        done();
    });

    lab.test('Trailing newline', function (done) {
        var workout = caber.parse('Squat 100x5x4\n');
        Code.expect(workout).to.have.length(1);
        Code.expect(workout[0].sets).to.have.length(4);
        done();
    });

    lab.test('No space on distance', function (done) {
        var workout = caber.parse('Cycling 3:00 35km');
        Code.expect(workout[0].sets[0].distance).to.equal(35);
        Code.expect(workout[0].sets[0].unit).to.equal('kilometers');
        workout = caber.parse('Cycling 3:00 35.4mi');
        Code.expect(workout[0].sets[0].distance).to.equal(35.4);
        Code.expect(workout[0].sets[0].unit).to.equal('miles');
        workout = caber.parse('Cycling 00:30 .5mi');
        Code.expect(workout[0].sets[0].distance).to.equal(0.5);
        Code.expect(workout[0].sets[0].unit).to.equal('miles');
        done();
    });

    lab.test('No double PR switching from weight to distance activity', function (done) {
        var workout = caber.parse('Squat 255x10x4\nBench 135x4x5*\nCycling 1:00 5 miles');
        Code.expect(workout[1].sets[4].pr).to.be.true();
        Code.expect(workout[2].sets[0].pr).to.not.be.true();
        done();
    });

    lab.test('Comments', function (done) {
        var workout = caber.parse('Squat 135x5, 200x3 (light leg day), Bench Press 123x10x3');
        Code.expect(workout).to.have.length(2);
        Code.expect(workout[1].name).to.equal('Bench Press');
        Code.expect(workout[0].comment).to.equal('light leg day');
        workout = caber.parse('Squat 135x5, 200x3 (sore), Bench Press 123x10x3');
        Code.expect(workout).to.have.length(2);
        Code.expect(workout[1].name).to.equal('Bench Press');
        Code.expect(workout[0].comment).to.equal('sore');
        workout = caber.parse('Squat 135x5, 200x3 (comment w number 5 in it), Bench Press 123x10x3');
        Code.expect(workout).to.have.length(2);
        Code.expect(workout[1].name).to.equal('Bench Press');
        Code.expect(workout[0].comment).to.equal('comment w number 5 in it');
        done();
    });

    lab.test('Zero weight', function (done) {
        var workout = caber.parse('Pull ups 0x5x5');
        Code.expect(workout[0].sets.length).to.equal(5);
        Code.expect(workout[0].sets[0].weight).to.equal(undefined);
        Code.expect(workout[0].sets[0].reps).to.equal(5);
        done();
    });

    lab.experiment('Natural time units', function () {
        lab.test ('Running 30 minutes', function (done) {
            var workout = caber.parse('Running 30 minutes');
            Code.expect(workout).to.have.length(1);
            Code.expect(workout[0].name).to.equal('Running');
            Code.expect(workout[0].sets).to.have.length(1);
            Code.expect(workout[0].sets[0].time).to.equal(1800);
            done();
        });

        lab.test ('30 min run', function (done) {
            var workout = caber.parse('30 min run');
            Code.expect(workout).to.have.length(1);
            Code.expect(workout[0].name).to.equal('run');
            Code.expect(workout[0].sets).to.have.length(1);
            Code.expect(workout[0].sets[0].time).to.equal(1800);
            done();
        });
        lab.test ('1:00:00 run', function (done) {
            var workout = caber.parse('1:00:00 run');
            Code.expect(workout).to.have.length(1);
            Code.expect(workout[0].name).to.equal('run');
            Code.expect(workout[0].sets).to.have.length(1);
            Code.expect(workout[0].sets[0].time).to.equal(3600);
            done();
        });
        lab.test('30 min run following rep-only activity', function (done) {
            var workout = caber.parse('pull up bar 5\n30 min run');
            Code.expect(workout).to.have.length(2);
            Code.expect(workout[0].name).to.equal('pull up');
            Code.expect(workout[0].sets).to.have.length(1);
            Code.expect(workout[1].name).to.equal('run');
            Code.expect(workout[0].sets[0].time).to.equal(3600);
            done();
        });
    });
});

