var Lab = require('lab');
var Code = require('code');
var moment = require('moment');

var lab = exports.lab = Lab.script();
var caber = require('../');

lab.experiment('Workout parse', function () {
    lab.test('README example', function (done) {
        var workout = caber.workout('Thursday Leg Day\nSquat 225x5x5\nBicycling 3:00');
        Code.expect(workout, 'parsed workout').to.include('name', 'date', 'activities');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment().day('Thursday').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(2);
        Code.expect(workout.activities[0].name, 'first parsed activity').to.equal('Squat');
        Code.expect(workout.activities[1].name, 'second parsed activity').to.equal('Bicycling');
        done();
    });

    lab.test('README example with date', function (done) {
        var workout = caber.workout('2/1/2015 Leg Day\nSquat 225x5x5\nBicycling 3:00');
        Code.expect(workout, 'parsed workout').to.include('name', 'date', 'activities');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(2);
        Code.expect(workout.activities[0].name, 'first parsed activity').to.equal('Squat');
        Code.expect(workout.activities[1].name, 'second parsed activity').to.equal('Bicycling');
        done();
    });

    lab.test('Name only', function (done) {
        var workout = caber.workout('Leg Day\nSquat 255x5x5');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date, 'parsed date').to.be.undefined();
        Code.expect(workout.activities, 'parsed activities').to.have.length(1);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');

        done();
    });

    lab.test('Weekday only', function (done) {
        var workout = caber.workout('Thursday\nSquat 255x5x5');
        Code.expect(workout.name, 'parsed name').to.be.undefined();
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment().day('Thursday').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(1);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');
        done();
    });

    lab.test('Date only', function (done) {
        var workout = caber.workout('2/1\nSquat 255x5x5');
        Code.expect(workout.name, 'parsed name').to.be.undefined();
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(1);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');
        done();
    });

    lab.test('Weekday then name on two lines', function (done) {
        var workout = caber.workout('Thursday\nLeg Day\nSquat 255x5x5');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment().day('Thursday').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(1);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');
        done();
    });

    lab.test('Date then name on two lines', function (done) {
        var workout = caber.workout('2/1/2015\nLeg Day\nSquat 255x5x5');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(1);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');
        done();
    });

    lab.test('Name then weekday on two lines', function (done) {
        var workout = caber.workout('Thursday\nLeg Day\nSquat 255x5x5');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment().day('Thursday').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(1);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');
        done();
    });

    lab.test('Name then date on two lines', function (done) {
        var workout = caber.workout('2/1/2015\nLeg Day\nSquat 255x5x5');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(1);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');
        done();
    });

    lab.test('Neither name nor date one line', function (done) {
        var workout = caber.workout('Squat 255x5x5');
        Code.expect(workout.name, 'parsed name').to.be.undefined();
        Code.expect(workout.date, 'parsed date').to.be.undefined();
        Code.expect(workout.activities, 'parsed activities').to.have.length(1);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');
        done();
    });

    lab.test('Neither name nor date more than line', function (done) {
        var workout = caber.workout('Squat 255x5x5\nBicycling 3:00');
        Code.expect(workout.name, 'parsed name').to.be.undefined();
        Code.expect(workout.date, 'parsed date').to.be.undefined();
        Code.expect(workout.activities, 'parsed activities').to.have.length(2);
        Code.expect(workout.activities[0].name, 'parsed activity').to.equal('Squat');
        Code.expect(workout.activities[1].name, 'parsed activity').to.equal('Bicycling');
        done();
    });

    lab.test('Only name', function (done) {
        var workout = caber.workout('Leg day');
        Code.expect(workout.name, 'parsed name').to.equal('Leg day');
        Code.expect(workout.date, 'parsed date').to.be.undefined();
        Code.expect(workout.activities, 'parsed activities').to.have.length(0);
        done();
    });

    lab.test('Only weekday', function (done) {
        var workout = caber.workout('Thursday');
        Code.expect(workout.name, 'parsed name').to.be.undefined();
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment().day('Thursday').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(0);
        done();
    });

    lab.test('Only date', function (done) {
        var workout = caber.workout('2/1/2015');
        Code.expect(workout.name, 'parsed name').to.be.undefined();
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(0);
        done();
    });

    lab.test('Only name and weekday', function (done) {
        var workout = caber.workout('Thursday Leg Day');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment().day('Thursday').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(0);
        done();
    });

    lab.test('Only name and date', function (done) {
        var workout = caber.workout('2/1/2015 Leg Day');
        Code.expect(workout.name, 'parsed name').to.equal('Leg Day');
        Code.expect(workout.date.format('MM-DD-YYYY'), 'parsed date').to.equal(moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
        Code.expect(workout.activities, 'parsed activities').to.have.length(0);
        done();
    });

});
