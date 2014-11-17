/*jshint expr: true*/
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var caber = require('../');

lab.experiment('Main Parse', function () {

    lab.test('README example', function (done) {
        var workout = caber.parse('Squat 135x5,  200x3, 225x4. Bench Press 100x9x4 Cycling 1:30:00 15 miles');
        Lab.expect(workout, 'parsed results').to.have.length(3);
        Lab.expect(workout[0].name, 'first entry name').to.equal('Squat');
        Lab.expect(workout[0].sets, 'parsed squat sets').to.have.length(3);
        Lab.expect(workout[0].sets[0], 'first squat set').to.include.keys('unit', 'weight', 'reps');
        Lab.expect(workout[0].sets[0].reps, 'first squat set reps').to.equal(5);
        Lab.expect(workout[0].sets[0].unit, 'first squat set unit').to.equal('lb');
        Lab.expect(workout[0].sets[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout[1].name, 'second entry name').to.equal('Bench Press');
        Lab.expect(workout[1].sets, 'parsed bench press sets').to.have.length(4);
        Lab.expect(workout[1].sets[0], 'first bench press set').to.include.keys('unit', 'weight', 'reps');
        Lab.expect(workout[1].sets[0].reps, 'first bench press set reps').to.equal(9);
        Lab.expect(workout[1].sets[0].weight, 'first bench press set reps').to.equal(100);
        Lab.expect(workout[2].name, 'third entry name').to.equal('Cycling');
        Lab.expect(workout[2].sets, 'parsed cycling sets').to.have.length(1);
        Lab.expect(workout[2].sets[0].time, 'parsed cycling time').to.equal('1:30:00');
        Lab.expect(workout[2].sets[0].unit, 'parsed cycling unit').to.equal('miles');
        Lab.expect(workout[2].sets[0].distance, 'parsed cycling distance').to.equal(15);
        done();
    });
    lab.test('Newline separator', function (done) {
        var workout = caber.parse('Squat 135x5, 200x3\nBench Press 123x10x3');
        Lab.expect(workout, 'parsed results').to.have.length(2);
        Lab.expect(workout[0].name, 'first entry name').to.equal('Squat');
        Lab.expect(workout[1].name, 'second entry name').to.equal('Bench Press');
        done();
    });

    lab.test('Comma separator', function (done) {
        var workout = caber.parse('Squat 135x5,200x3 Bench Press 123x10x3');
        Lab.expect(workout, 'parsed results').to.have.length(2);
        Lab.expect(workout[0].sets, 'parsed squat sets').to.have.length(2);
        Lab.expect(workout[0].sets[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout[0].sets[0].reps, 'first squat set reps').to.equal(5);
        Lab.expect(workout[0].sets[1].weight, 'second squat set weight').to.equal(200);
        Lab.expect(workout[0].sets[1].reps, 'second squat set reps').to.equal(3);
        done();
    });

    lab.test('Spaces between weight/reps', function (done) {
        var workout = caber.parse('Squat 135 x 5');
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].name, 'first entry name').to.equal('Squat');
        Lab.expect(workout[0].sets, 'parsed squat results').to.have.length(1);
        Lab.expect(workout[0].sets[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout[0].sets[0].reps, 'first squat set reps').to.equal(5);
        workout = caber.parse('Squat 135x 5');
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].name, 'first entry name').to.equal('Squat');
        Lab.expect(workout[0].sets, 'parsed squat results').to.have.length(1);
        Lab.expect(workout[0].sets[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout[0].sets[0].reps, 'first squat set reps').to.equal(5);
        workout = caber.parse('Squat 135 x5');
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].name, 'first entry name').to.equal('Squat');
        Lab.expect(workout[0].sets, 'parsed squat results').to.have.length(1);
        Lab.expect(workout[0].sets[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout[0].sets[0].reps, 'first squat set reps').to.equal(5);
        done();
    });

    lab.test('Reps no weight', function (done) {
        var workout = caber.parse('Pull ups 5, 5, 5');
        Lab.expect(workout[0].sets, 'parsed pull ups results').to.have.length(3);
        Lab.expect(workout[0].sets[0].reps, 'first pull ups set reps').to.equal(5);
        Lab.expect(workout[0].sets[0].weight, 'first pull ups set weight').to.be.undefined;
        Lab.expect(workout[0].sets[0].unit, 'first pull ups set unit').to.be.undefined;
        done();
    });

    lab.test('PR star', function (done) {
        var workout = caber.parse('Deadlift 450x5, 500x1*');
        Lab.expect(workout[0].sets[0].pr, 'second set pr').to.not.be.true;
        Lab.expect(workout[0].sets[1].pr, 'second set pr').to.be.true;
        done();
    });

    lab.test('PR on last set only', function (done) {
        var workout = caber.parse('OHP 185x1x2*');
        Lab.expect(workout[0].sets[0].pr, 'second set pr').to.not.be.true;
        Lab.expect(workout[0].sets[1].pr, 'second set pr').to.be.true;
        done();
    });

    lab.test('PR on time/distance', function (done) {
        var workout = caber.parse('Cycling 1:00 5 miles*');
        Lab.expect(workout[0].sets[0].pr, 'pr').to.be.true;
        Lab.expect(workout[0].sets[0].time, 'parsed time').to.equal('1:00');
        Lab.expect(workout[0].sets[0].distance, 'parsed distance').to.equal(5);
        Lab.expect(workout[0].sets[0].unit, 'parsed unit').to.equal('miles');
        done();
    });

    lab.test('Trailing space', function (done) {
        var workout = caber.parse('Squat 100x5x4 ');
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'parsed sets').to.have.length(4);
        done();
    });

    lab.test('Trailing newline', function (done) {
        var workout = caber.parse('Squat 100x5x4\n');
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'parsed sets').to.have.length(4);
        done();
    });

    lab.test('No space on distance', function (done) {
        var workout = caber.parse('Cycling 3:00 35km');
        Lab.expect(workout[0].sets[0].distance, 'parsed distance').to.equal(35);
        Lab.expect(workout[0].sets[0].unit, 'parsed distance').to.equal('kilometers');
        workout = caber.parse('Cycling 3:00 35.4mi');
        Lab.expect(workout[0].sets[0].distance, 'parsed cycling distance').to.equal(35.4);
        Lab.expect(workout[0].sets[0].unit, 'parsed cycling distance').to.equal('miles');
        workout = caber.parse('Cycling 00:30 .5mi');
        Lab.expect(workout[0].sets[0].distance, 'parsed cycling distance').to.equal(0.5);
        Lab.expect(workout[0].sets[0].unit, 'parsed cycling distance').to.equal('miles');
        done();
    });

    lab.test('No double PR switching from weight to distance activity', function (done) {
        var workout = caber.parse('Squat 255x10x4\nBench 135x4x5*\nCycling 1:00 5 miles');
        Lab.expect(workout[1].sets[4].pr, 'Last parsed bench set pr').to.be.true;
        Lab.expect(workout[2].sets[0].pr, 'Parsed cycling result pr').to.not.be.true;
        done();
    });

    lab.test('Comments', function (done) {
        var workout = caber.parse('Squat 135x5, 200x3 (light leg day), Bench Press 123x10x3');
        Lab.expect(workout, 'parsed results').to.have.length(2);
        Lab.expect(workout[1].name, 'second entry name').to.equal('Bench Press');
        Lab.expect(workout[0].comment, 'first entry comment').to.equal('light leg day');
        workout = caber.parse('Squat 135x5, 200x3 (sore), Bench Press 123x10x3');
        Lab.expect(workout, 'parsed results').to.have.length(2);
        Lab.expect(workout[1].name, 'second entry name').to.equal('Bench Press');
        Lab.expect(workout[0].comment, 'first entry comment').to.equal('sore');
        workout = caber.parse('Squat 135x5, 200x3 (comment w number 5 in it), Bench Press 123x10x3');
        Lab.expect(workout, 'parsed results').to.have.length(2);
        Lab.expect(workout[1].name, 'second entry name').to.equal('Bench Press');
        Lab.expect(workout[0].comment, 'first entry comment').to.equal('comment w number 5 in it');
        done();
    });
});

