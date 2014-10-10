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
});
