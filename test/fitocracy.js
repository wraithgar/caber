/*jshint expr: true*/
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var caber = require('../');

lab.experiment('Fitocracy parse', function () {
    lab.test('with lifts', function (done) {
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

    lab.test('with time/distance', function (done) {
        var fito = 'Gartracked Workout for 104 ptsOct 12, 2014\nWalking\n01:00:00 | 3 mi';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.include.keys('Walking');
        Lab.expect(workout.Walking, 'parsed walking result').to.have.length(1);
        Lab.expect(workout.Walking[0].time, 'first walking set time').to.equal('01:00:00');
        Lab.expect(workout.Walking[0].distance, 'first walking set distance').to.equal(3);
        Lab.expect(workout.Walking[0].unit, 'first walking set unit').to.equal('mi');
        done();
    });

    lab.test('with weighted/assisted', function (done) {
        var fito = 'GartrackedWorkout for 200ptsOct 5, 2015\nRing Pull-Up\n5 reps 43\n4 reps | weighted | 55 lb 66\n5 reps | weighted | 35 lb 69\n5 reps | weighted | 35 lb 69\n1 reps | weighted | 64 lb (PR) 12\n1 reps | assisted | 43 lb 9\n5 reps 43\n';
        var workout = caber.fitocracy(fito);
        Lab.expect(workout, 'parsed results').to.include.keys('Ring Pull-Up');
        Lab.expect(workout['Ring Pull-Up'], 'parsed ring pull-up result').to.have.length(7);
        Lab.expect(workout['Ring Pull-Up'][5].weight, 'sixth parsed ring pull-up set weight').to.equal(-43);
        done();
    });

});
