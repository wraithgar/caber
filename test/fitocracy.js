/*jshint expr: true*/
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var caber = require('../');

lab.experiment('Fitocracy parse', function () {
    lab.test('with lifts', function (done) {
        var fito = 'Gartracked Workout for 1000ptsOct 9, 2014\nCurls\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\nHammer Curls\n135 lb x 10 reps 25\n135 lb x 10 reps 25\n135 lb x 10 reps 25\n135lb x 10 reps 25\nDB Curls\n25 lb x 10 reps 57\n25 lb x 10 reps 57\n25 lb x 10 reps (PR) 57';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout, 'prased results').to.have.length(3);
        Lab.expect(workout[0].name, 'first activity name').to.equal('Curls');
        Lab.expect(workout[0].sets, 'first activity sets').to.have.length(5);
        Lab.expect(workout[0].sets[0].weight, 'first curls set weight').to.equal(15);
        Lab.expect(workout[0].sets[0].reps, 'first curls set weight').to.equal(10);
        Lab.expect(workout[0].sets[0].unit, 'first curls set weight').to.equal('lb');
        Lab.expect(workout[1].name, 'second activity name').to.equal('Hammer Curls');
        Lab.expect(workout[1].sets, 'second activity sets').to.have.length(4);
        Lab.expect(workout[2].name, 'third activity name').to.equal('DB Curls');
        Lab.expect(workout[2].sets, 'third activity sets').to.have.length(3);
        Lab.expect(workout[2].sets[2].pr, 'third db curls set pr').to.be.true;
        done();
    });
    lab.test('with time/distance', function (done) {
        var fito = 'Gartracked Workout for 104 ptsOct 12, 2014\nWalking\n01:00:00 | 3 mi';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout[0].sets[0].time, 'time').to.equal('01:00:00');
        Lab.expect(workout[0].sets[0].distance, 'distance').to.equal(3);
        Lab.expect(workout[0].sets[0].unit, 'unit').to.equal('mi');
        done();
    });

    lab.test('with weighted/assisted', function (done) {
        var fito = 'GartrackedWorkout for 200ptsOct 5, 2015\nRing Pull-Up\n5 reps 43\n4 reps | weighted | 55 lb 66\n5 reps | weighted | 35 lb 69\n5 reps | weighted | 35 lb 69\n1 reps | weighted | 64 lb (PR) 12\n1 reps | assisted | 43 lb 9\n5 reps 43\n';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout[0].sets, 'sets').to.have.length(7);
        Lab.expect(workout[0].sets[0].reps, 'first set reps').to.equal(5);
        Lab.expect(workout[0].sets[0].weight, 'first set weight').to.equal(undefined);
        Lab.expect(workout[0].sets[1].reps, 'second set reps').to.equal(4);
        Lab.expect(workout[0].sets[1].weight, 'second set weight').to.equal(55);
        Lab.expect(workout[0].sets[5].reps, 'sixth set reps').to.equal(1);
        Lab.expect(workout[0].sets[5].weight, 'sixth set weight').to.equal(-43);
        done();
    });

    lab.test('copied too much', function (done) {
        var fito = 'Gartracked Workout for 1,337 ptsJan 1, 2014\nBarbell Bench Press\n55 lb x 10 reps 60\n55 lb x 10 reps 60\n55 lb x 10 reps 60\nComment\nProp\nShare\n';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'sets').to.have.length(3);

        fito = 'Gartracked Workout for 1,337 ptsJan 1, 2014\nBarbell Bench Press\n55 lb x 10 reps 60\n55 lb x 10 reps 60\n55 lb x 10 reps 60\nComment\nProp\nShare';
        workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'sets').to.have.length(3);

        fito = 'Gartracked Workout for 1,337 ptsJan 1, 2014\nBarbell Bench Press\n55 lb x 10 reps 60\n55 lb x 10 reps 60\n55 lb x 10 reps 60\nComment\nProp\n';
        workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'sets').to.have.length(3);

        fito = 'Gartracked Workout for 1,337 ptsJan 1, 2014\nBarbell Bench Press\n55 lb x 10 reps 60\n55 lb x 10 reps 60\n55 lb x 10 reps 60\nComment\nProp';
        workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'sets').to.have.length(3);

        fito = 'Gartracked Workout for 1,337 ptsJan 1, 2014\nBarbell Bench Press\n55 lb x 10 reps 60\n55 lb x 10 reps 60\n55 lb x 10 reps 60\nComment\n';
        workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'sets').to.have.length(3);

        fito = 'Gartracked Workout for 1,337 ptsJan 1, 2014\nBarbell Bench Press\n55 lb x 10 reps 60\n55 lb x 10 reps 60\n55 lb x 10 reps 60\nComment';
        workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'sets').to.have.length(3);

        done();
    });

    lab.test('trailing newline', function (done) {
        var fito = 'Gartracked Workout for 1,337 ptsJan 1, 2014\nBarbell Bench Press\n55 lb x 10 reps 60\n55 lb x 10 reps 60\n55 lb x 10 reps 60\n';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.have.length(1);
        Lab.expect(workout[0].sets, 'sets').to.have.length(3);
        done();
    });

    lab.test('comments', function (done) {
        var fito = 'Gartracked Workout for 1,337 ptsJan 1, 2014\nBarbell Squat\n185 lb x 5 reps 92\n225 lb x 5 reps 121\n265 lb x 5 reps 158\n295 lb x 5 reps 194\n335 lb x 4 reps 232\nthis is a comment\nBarbell Bench Press\n185 lb x 5 reps 92\n';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.have.length(2);
        Lab.expect(workout[1].name, 'second entry name').to.equal('Barbell Bench Press');
        Lab.expect(workout[0].comment, 'first entry comment').to.equal('this is a comment');
        done();
    });
});
