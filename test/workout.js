'use strict';

var Lab = require('lab');
var Code = require('code');
var Moment = require('Moment');

var lab = exports.lab = Lab.script();
var Caber = require('../');

var realdow = function realdow (dow) {

  var today = Moment();
  var day = Moment().day(dow);
  if (day > today) {
    day.subtract(1, 'week');
  }
  return day;
};

lab.experiment('Workout parse', function () {

  lab.test('README example', function (done) {

    var workout = Caber.workout('Thursday Leg Day\nSquat 225x5x5\nBicycling 3:00');
    Code.expect(workout).to.include('name', 'date', 'activities');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(2);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    Code.expect(workout.activities[1].name).to.equal('Bicycling');
    done();
  });

  lab.test('README example with date', function (done) {

    var workout = Caber.workout('2/1/2015 Leg Day\nSquat 225x5x5\nBicycling 3:00');
    Code.expect(workout).to.include('name', 'date', 'activities');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(2);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    Code.expect(workout.activities[1].name).to.equal('Bicycling');
    done();
  });

  lab.test('Name only', function (done) {

    var workout = Caber.workout('Leg Day\nSquat 255x5x5');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date).to.be.undefined();
    Code.expect(workout.activities).to.have.length(1);
    Code.expect(workout.activities[0].name).to.equal('Squat');

    done();
  });

  lab.test('Weekday only', function (done) {

    var workout = Caber.workout('Friday\nSquat 255x5x5');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Friday').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(1);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    done();
  });

  lab.test('Date only', function (done) {

    var workout = Caber.workout('2/1\nSquat 255x5x5');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(1);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    done();
  });

  lab.test('Weekday then name on two lines', function (done) {

    var workout = Caber.workout('Thursday\nLeg Day\nSquat 255x5x5');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(1);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    done();
  });

  lab.test('Date then name on two lines', function (done) {

    var workout = Caber.workout('2/1/2015\nLeg Day\nSquat 255x5x5');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(1);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    done();
  });

  lab.test('Name then weekday on two lines', function (done) {

    var workout = Caber.workout('Thursday\nLeg Day\nSquat 255x5x5');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(1);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    done();
  });

  lab.test('Name then date on two lines', function (done) {

    var workout = Caber.workout('2/1/2015\nLeg Day\nSquat 255x5x5');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(1);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    done();
  });

  lab.test('Neither name nor date one line', function (done) {

    var workout = Caber.workout('Squat 255x5x5');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date).to.be.undefined();
    Code.expect(workout.activities).to.have.length(1);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    workout = Caber.workout('Run 30 min');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date).to.be.undefined();
    workout = Caber.workout('Pull up 5,5,5');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date).to.be.undefined();
    workout = Caber.workout('Pull up 5');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date).to.be.undefined();
    done();
  });

  lab.test('Neither name nor date more than line', function (done) {

    var workout = Caber.workout('Squat 255x5x5\nBicycling 3:00');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date).to.be.undefined();
    Code.expect(workout.activities).to.have.length(2);
    Code.expect(workout.activities[0].name).to.equal('Squat');
    Code.expect(workout.activities[1].name).to.equal('Bicycling');
    done();
  });

  lab.test('Only name', function (done) {

    var workout = Caber.workout('Leg day');
    Code.expect(workout.name).to.equal('Leg day');
    Code.expect(workout.date).to.be.undefined();
    Code.expect(workout.activities).to.have.length(0);
    done();
  });

  lab.test('Only weekday', function (done) {

    var workout = Caber.workout('Thursday');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(0);
    done();
  });

  lab.test('Only date', function (done) {

    var workout = Caber.workout('2/1/2015');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(0);
    done();
  });

  lab.test('Only name and weekday', function (done) {

    var workout = Caber.workout('Thursday Leg Day');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(0);
    done();
  });

  lab.test('Only name and date', function (done) {

    var workout = Caber.workout('2/1/2015 Leg Day');
    Code.expect(workout.name).to.equal('Leg Day');
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'));
    Code.expect(workout.activities).to.have.length(0);
    done();
  });

  lab.test('ISO-8601 date', function (done) {

    var workout = Caber.workout('2015-02-01');
    Code.expect(workout.name).to.be.undefined();
    Code.expect(workout.date.format('YYYY-MM-DD')).to.equal(Moment('2015-02-01', 'YYYY-MM-DD').format('YYYY-MM-DD'));
    Code.expect(workout.activities).to.have.length(0);
    done();
  });
});
