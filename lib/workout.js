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
      if (date > Moment()) {
        date.subtract(1, 'week');
      }
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
  if (date && name && name.search(/[0-9]/) > -1) {
    name = undefined;
  }
  return { name: name, date: date, rawDate: rawDate };
};

module.exports = function workout(data) {

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
  workoutData.activities = Parse(lines.join('\n'));
  return workoutData;
};
