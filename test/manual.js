var Lab = require('lab');
var lab = exports.lab = Lab.script();
var caber = require('../');

lab.experiment('Main Parse', function () {

    lab.test('README example', function (done) {
        var workout = caber.parse('Squat 135x5,  200x3, 225x4. Bench Press 100x9x4');
        Lab.expect(workout, 'parsed results').to.include.keys('Squat', 'Bench Press');
        Lab.expect(workout.Squat, 'parsed squat sets').to.have.length(3);
        Lab.expect(workout['Bench Press'], 'parsed bench press sets').to.have.length(4);
        Lab.expect(workout.Squat[0], 'first squat set').to.include.keys('unit', 'weight', 'reps');
        Lab.expect(workout.Squat[0].reps, 'first squat set reps').to.equal(5);
        Lab.expect(workout.Squat[0].unit, 'first squat set unit').to.equal('lb');
        Lab.expect(workout.Squat[1].weight, 'first squat set weight').to.equal(200);
        Lab.expect(workout['Bench Press'][0], 'first bench press set').to.include.keys('unit', 'weight', 'reps');
        Lab.expect(workout['Bench Press'][0].reps, 'first bench press set reps').to.equal(9);
        Lab.expect(workout['Bench Press'][0].weight, 'first bench press set reps').to.equal(100);
        done();
    });

    lab.test('Empty string', function (done) {
        var workout = caber.parse('');
        Lab.expect(workout, 'parsed results').to.be.empty;
        done();
    });

    lab.test('Newline separator', function (done) {
        var workout = caber.parse('Squat 135x5, 200x3\nBench Press 123x10x3');
        Lab.expect(workout, 'parsed results').to.include.keys('Squat', 'Bench Press');
        Lab.expect(workout.Squat, 'parsed squat set').to.have.length(2);
        done();
    });

    lab.test('Comma separator', function (done) {
        var workout = caber.parse('Squat 135x5,200x3 Bench Press 123x10x3');
        Lab.expect(workout, 'parsed results').to.include.keys('Squat', 'Bench Press');
        Lab.expect(workout.Squat, 'parsed squat results').to.have.length(2);
        Lab.expect(workout.Squat[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout.Squat[0].reps, 'first squat set reps').to.equal(5);
        Lab.expect(workout.Squat[1].weight, 'second squat set weight').to.equal(200);
        Lab.expect(workout.Squat[1].reps, 'second squat set reps').to.equal(3);
        done();
    });

    lab.test('Spaces between weight/reps', function (done) {
        var workout = caber.parse('Squat 135 x 5');
        Lab.expect(workout, 'parsed results').to.include.keys('Squat');
        Lab.expect(workout.Squat, 'parsed squat results').to.have.length(1);
        Lab.expect(workout.Squat[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout.Squat[0].reps, 'first squat set reps').to.equal(5);
        var workout = caber.parse('Squat 135x 5');
        Lab.expect(workout, 'parsed results').to.include.keys('Squat');
        Lab.expect(workout.Squat, 'parsed squat results').to.have.length(1);
        Lab.expect(workout.Squat[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout.Squat[0].reps, 'first squat set reps').to.equal(5);
        var workout = caber.parse('Squat 135 x5');
        Lab.expect(workout, 'parsed results').to.include.keys('Squat');
        Lab.expect(workout.Squat, 'parsed squat results').to.have.length(1);
        Lab.expect(workout.Squat[0].weight, 'first squat set weight').to.equal(135);
        Lab.expect(workout.Squat[0].reps, 'first squat set reps').to.equal(5);
        done();
    });

    lab.test('Reps no weight', function (done) {
        var workout = caber.parse('Pull ups 5, 5, 5');
        Lab.expect(workout, 'parsed results').to.include.keys('Pull ups');
        Lab.expect(workout['Pull ups'], 'parsed pull ups results').to.have.length(3);
        Lab.expect(workout['Pull ups'][0].reps, 'first pull ups set reps').to.equal(5);
        Lab.expect(workout['Pull ups'][0].weight, 'first pull ups set weight').to.be.undefined;
        Lab.expect(workout['Pull ups'][0].unit, 'first pull ups set unit').to.be.undefined;
        done();
    });

    lab.test('PR star', function (done) {
        var workout = caber.parse('Deadlift 450x5, 500x1*');
        Lab.expect(workout, 'parsed results').to.include.keys('Deadlift');
        Lab.expect(workout.Deadlift, 'parsed deadlift set').to.have.length(2);
        Lab.expect(workout.Deadlift[1].pr, 'second deadlift set pr').to.be.true;
        done();
    });

    lab.test('PR on last set only', function (done) {
        var workout = caber.parse('OHP 185x1x2*');
        Lab.expect(workout, 'parsed results').to.include.keys('OHP');
        Lab.expect(workout.OHP, 'parsed OHP results').to.have.length(2);
        Lab.expect(workout.OHP[0].pr, 'first OHP set pr').to.not.be.true;
        Lab.expect(workout.OHP[1].pr, 'second OHP set pr').to.be.true;
        done();
    });

    lab.test('parse non strings', function (done) {
        Lab.expect(function () {
            var workout = caber.parse();
        }).to.throw(TypeError);
        Lab.expect(function () {
            var workout = caber.parse(5);
        }).to.throw(TypeError);
        Lab.expect(function () {
            var workout = caber.parse(undefined);
        }).to.throw(TypeError);
        Lab.expect(function () {
            var workout = caber.parse(null);
        }).to.throw(TypeError);
        done();
    });

    lab.test('fitocracy copy/paste', function (done) {
        var fito = 'Gartracked Workout for 1000ptsOct 9, 2014\nCurls\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\nHammer Curls\n135 lb x 10 reps 25\n135 lb x 10 reps 25\n135 lb x 10 reps 25\n135lb x 10 reps 25\nDB Curls\n25 lb x 10 reps 57\n25 lb x 10 reps 57\n25 lb x 10 reps (PR) 57';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.include.keys('Curls', 'Hammer Curls', 'DB Curls');
        Lab.expect(workout.Curls, 'parsed curls result').to.have.length(5);
        Lab.expect(workout['Hammer Curls'], 'parsed hammer curls result').to.have.length(4);
        Lab.expect(workout['DB Curls'], 'parsed db curls result').to.have.length(3);
        Lab.expect(workout.Curls[0].weight, 'first curls set weight').to.equal(15);
        Lab.expect(workout.Curls[0].reps, 'first curls set weight').to.equal(10);
        Lab.expect(workout.Curls[0].unit, 'first curls set weight').to.equal('lb');
        Lab.expect(workout['DB Curls'][2].pr, 'third db curls set pr').to.be.true;
        done();
    });
});
