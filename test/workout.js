'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Moment = require('moment')

const lab = exports.lab = Lab.script()
const Caber = require('../')

const realdow = function realdow (dow) {
  const day = Moment().day(dow)
  const today = Moment()
  if (day > today) {
    day.subtract(1, 'week')
  }
  return day
}

const tomorrow = Moment().add(1, 'day')
const yesterday = Moment().subtract(1, 'day')

lab.experiment('Workout parse', function () {
  lab.test('README example', function () {
    const workout = Caber.workout('Thursday Leg Day\nSquat 225x5x5\nBicycling 3:00')
    Code.expect(workout).to.include(['name', 'date', 'activities'])
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.rawDate).to.equal('Thursday')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'))
    Code.expect(workout.activities).to.have.length(2)
    Code.expect(workout.activities[0].name).to.equal('Squat')
    Code.expect(workout.activities[1].name).to.equal('Bicycling')
  })

  lab.test('README example with date', function () {
    const workout = Caber.workout('2/1/2015 Leg Day\nSquat 225x5x5\nBicycling 3:00')
    Code.expect(workout).to.include(['name', 'date', 'activities'])
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.rawDate).to.equal('2/1/2015')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'))
    Code.expect(workout.activities).to.have.length(2)
    Code.expect(workout.activities[0].name).to.equal('Squat')
    Code.expect(workout.activities[1].name).to.equal('Bicycling')
  })

  lab.test('Name only', function () {
    const workout = Caber.workout('Leg Day\nSquat 255x5x5')
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.date).to.be.undefined()
    Code.expect(workout.rawDate).to.be.undefined()
    Code.expect(workout.activities).to.have.length(1)
    Code.expect(workout.activities[0].name).to.equal('Squat')
  })

  lab.test('Weekday only', function () {
    const workout = Caber.workout('Friday\nSquat 255x5x5')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.rawDate).to.be.equal('Friday')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Friday').format('MM-DD-YYYY'))
    Code.expect(workout.activities).to.have.length(1)
    Code.expect(workout.activities[0].name).to.equal('Squat')
  })

  lab.test('Date only', function () {
    const workout = Caber.workout('2/1\nSquat 255x5x5')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.rawDate).to.be.equal('2/1')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1', 'MM-DD').format('MM-DD-YYYY'))
    Code.expect(workout.activities).to.have.length(1)
    Code.expect(workout.activities[0].name).to.equal('Squat')
  })

  lab.test('Weekday then name on two lines', function () {
    const workout = Caber.workout('Thursday\nLeg Day\nSquat 255x5x5')
    Code.expect(workout.rawDate).to.be.equal('Thursday')
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'))
    Code.expect(workout.activities).to.have.length(1)
    Code.expect(workout.activities[0].name).to.equal('Squat')
  })

  lab.test('Date then name on two lines', function () {
    const workout = Caber.workout('2/1/2015\nLeg Day\nSquat 255x5x5')
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.rawDate).to.be.equal('2/1/2015')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'))
    Code.expect(workout.activities).to.have.length(1)
    Code.expect(workout.activities[0].name).to.equal('Squat')
  })

  lab.test('Name then weekday on two lines', function () {
    const workout = Caber.workout('Thursday\nLeg Day\nSquat 255x5x5')
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.rawDate).to.be.equal('Thursday')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'))
    Code.expect(workout.activities).to.have.length(1)
    Code.expect(workout.activities[0].name).to.equal('Squat')
  })

  lab.test('Name then date on two lines', function () {
    const workout = Caber.workout('2/1/2015\nLeg Day\nSquat 255x5x5')
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.rawDate).to.be.equal('2/1/2015')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'))
    Code.expect(workout.activities).to.have.length(1)
    Code.expect(workout.activities[0].name).to.equal('Squat')
  })

  lab.test('Neither name nor date one line', function () {
    let workout = Caber.workout('Squat 255x5x5')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.date).to.be.undefined()
    Code.expect(workout.rawDate).to.be.undefined()
    Code.expect(workout.activities).to.have.length(1)
    Code.expect(workout.activities[0].name).to.equal('Squat')
    workout = Caber.workout('Run 30 min')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.date).to.be.undefined()
    Code.expect(workout.rawDate).to.be.undefined()
    workout = Caber.workout('Pull up 5,5,5')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.date).to.be.undefined()
    Code.expect(workout.rawDate).to.be.undefined()
    workout = Caber.workout('Pull up 5')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.date).to.be.undefined()
    Code.expect(workout.rawDate).to.be.undefined()
  })

  lab.test('Neither name nor date more than line', function () {
    const workout = Caber.workout('Squat 255x5x5\nBicycling 3:00')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.rawDate).to.be.undefined()
    Code.expect(workout.date).to.be.undefined()
    Code.expect(workout.activities).to.have.length(2)
    Code.expect(workout.activities[0].name).to.equal('Squat')
    Code.expect(workout.activities[1].name).to.equal('Bicycling')
  })

  lab.test('Only name', function () {
    const workout = Caber.workout('Leg day')
    Code.expect(workout.name).to.equal('Leg day')
    Code.expect(workout.date).to.be.undefined()
    Code.expect(workout.rawDate).to.be.undefined()
    Code.expect(workout.activities).to.have.length(0)
  })

  lab.test('Only weekday', function () {
    const workout = Caber.workout('Thursday')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'))
    Code.expect(workout.rawDate).to.equal('Thursday')
    Code.expect(workout.activities).to.have.length(0)
  })

  lab.test('Only date', function () {
    const workout = Caber.workout('2/1/2015')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'))
    Code.expect(workout.rawDate).to.equal('2/1/2015')
    Code.expect(workout.activities).to.have.length(0)
  })

  lab.test('Only name and weekday', function () {
    const workout = Caber.workout('Thursday Leg Day')
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(realdow('Thursday').format('MM-DD-YYYY'))
    Code.expect(workout.rawDate).to.equal('Thursday')
    Code.expect(workout.activities).to.have.length(0)
  })

  lab.test('Only name and date', function () {
    const workout = Caber.workout('2/1/2015 Leg Day')
    Code.expect(workout.name).to.equal('Leg Day')
    Code.expect(workout.date.format('MM-DD-YYYY')).to.equal(Moment('2-1-2015', 'MM-DD-YYYY').format('MM-DD-YYYY'))
    Code.expect(workout.rawDate).to.equal('2/1/2015')
    Code.expect(workout.activities).to.have.length(0)
  })

  lab.test('ISO-8601 date', function () {
    const workout = Caber.workout('2015-02-01')
    Code.expect(workout.name).to.be.undefined()
    Code.expect(workout.date.format('YYYY-MM-DD')).to.equal(Moment('2015-02-01', 'YYYY-MM-DD').format('YYYY-MM-DD'))
    Code.expect(workout.rawDate).to.equal('2015-02-01')
    Code.expect(workout.activities).to.have.length(0)
  })

  lab.test('Incomplete log', function () {
    // Shouldn't crash
    const workout = Caber.workout('Leg day\n255x5')
    Code.expect(workout).to.exist()
  })

  lab.test('Workout with numbers in the name', function () {
    const workout = Caber.workout('531 Bench\nBench Press 135x1')
    Code.expect(workout.name).to.equal('531 Bench')
  })

  lab.test('Workout with numbers in the name on second line', function () {
    const workout = Caber.workout('1/1\n531 Bench\nBench Press 135x1')
    Code.expect(workout.name).to.equal('531 Bench')
  })

  lab.test('Tomorrow', function () {
    const workout = Caber.workout(tomorrow.format('dddd') + '\nBench Press 135x1')
    Code.expect(workout.date.format('YYYY-MM-DD')).to.equal(tomorrow.subtract(1, 'week').format('YYYY-MM-DD'))
  })

  lab.test('Yesterday', function () {
    const workout = Caber.workout(yesterday.format('dddd') + '\nBench Press 135x1')
    Code.expect(workout.date.format('YYYY-MM-DD')).to.equal(yesterday.format('YYYY-MM-DD'))
  })

  lab.test('date, name with numbers, activity, newline separated', function () {
    const workout = Caber.workout('1/1\n531 Bench\nBench Press 135x1')
    Code.expect(workout.name).to.equal('531 Bench')
  })

  lab.test('name then date', function () {
    const workout = Caber.workout('Bench\n1/1\nBench Press 135x1')
    Code.expect(workout.name).to.equal('Bench')
    Code.expect(workout.date.format('MM-DD')).to.equal('01-01')
  })
})
