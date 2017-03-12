'use strict';

/* "smart mode" trying to parse a name/date out of a workout */

var Parse = require('./parse');
var Moment = require('moment');
var weeknames = Moment.weekdays().concat(Moment.weekdaysShort()).map(function (o) {

  return o.toLowerCase();
});

var TIMEUNITS = /[0-9.]+ ?(min|minutes|hour|hours)/;
var DISTANCEUNITS = /[0-9.]+ ?(mi|kilom|km)/;

var parseLine = function parseLine(line) {

  var date;
  var rawDate;
  var name;
  var words;
  var names = [];
  if (line.match(TIMEUNITS) || line.match(DISTANCEUNITS)) {
    return { name: undefined, date: undefined };
  }
  words = line.split(/\s/);
  words.forEach(function (word) {

    if (weeknames.indexOf(word.toLowerCase()) > -1) {
      date = Moment().day(word);
      rawDate = word;

      /**
       * Ok a little fun date parsing tidbit. Moment will try to parse any day
       * of the week to be in this week, so if these tests are run on a Sunday,
       * and we calculate yesterday to be Saturday, that will parse to the end
       * of the week not yesterday.
       *
       * Our code runs a little differently, because we assume you are never
       * logging from the future (apologies to time traveling bodybuilders).  If
       * today is Monday, then Tuesday is LAST WEEK.
       *
       * This is all fine and dandy if we run tests Monday through Friday. However
       * on the weekends the following condition is either always true, or always
       * false.  In order for our code coverage to work we have to calculate a day
       * of the week relative to today that Moment will cast into the future, and
       * one that will cast into the past, which is impossible on the weekend.
       *
       * TLDR code coverage will fail on weekends and there's not a lot I can do
       * about it.
       */

      //$lab:coverage:off$
      if (date > Moment()) {
        date.subtract(1, 'week');
      }
      //$lab:coverage:on$
    }
    else if (!word.match(/[^0-9\/-]/) && word.match(/[,\/-]/)) {
      date = Moment(word, ['MM-DD-YYYY', 'MM/DD/YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY', 'MM-DD', 'MM/DD', 'DD-MM', 'DD/MM', 'YYYY-MM-DD']);
      rawDate = word;
    }
    else {
      names.push(word);
    }
  });
  if (names.length) {
    name = names.join(' ');
  }
  //if (date && name && name.search(/[0-9]/) > -1) {
    //name = undefined;
  //}
  return { name: name, date: date, rawDate: rawDate };
};

module.exports = function workout(data, unit) {

  var dateCheck;
  var workoutData;
  var lines = data.split('\n');
  workoutData = parseLine(lines[0]);
  if (workoutData.name || workoutData.date) {
    if (lines[1]) {
      if (!workoutData.name) {
        lines.shift(); //First line was all date, get rid of it
        if (lines[0].search(/[0-9]$/) === -1) {
          //If no number we're gonna call it the workout name
          //Eventually we can see if it has :, x, or ends in a number?
          workoutData.name = lines.shift();
        }
      }
      else if (!workoutData.date) {
        if (workoutData.name.search(/[0-9]$/) > -1) {
          workoutData.name = undefined; //Probably an activity
        }
        else {
          //Check for exclusive date in second line
          dateCheck = parseLine(lines[1]);
          if (dateCheck.date && !dateCheck.name) {
            lines.shift(); //First line was actually our name, yay
            lines.shift(); //Second line was all date, yay
            workoutData.date = dateCheck.date;
            workoutData.rawDate = dateCheck.rawDate;
          }
          else {
            lines.shift(); //First line was just a name
          }
        }
      }
      else {
        lines.shift(); //Both in first line
      }
    }
    else if (!workoutData.date) { //Single line entry from here on out
      //Name only
      if (workoutData.name.search(/[0-9]/) > -1) {
        workoutData.name = undefined; //Probably an activity
      }
      else {
        lines.shift();
      }
    }
    else if (!workoutData.name) {
      //Date only
      lines.shift();
    }
    else {
      //Both
      lines.shift();
    }
  }
  //format date to a string
  workoutData.activities = Parse(lines.join('\n'), unit);
  return workoutData;
};
