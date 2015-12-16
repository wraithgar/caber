'use strict';

module.exports = function fitocracy (data) {

  var currentActivity;
  var line;
  var lines;
  var match;
  var setData;
  var currentIndex = -1;
  var parsed = [];
  if (typeof data !== 'string') {
    throw new TypeError('Caber can only parse strings, tried parsing ' + typeof data);
  }
  lines = data.split(/\n/);

  while (lines.length > 0) {
    line = lines.shift();
    //if (line.match(/tracked ?[\w ]\+ ?for ?[0-9]+ ?pts/)) {
    //Header, ignore for now, use as title when we add 'workout'
    //Sets always end with a number in points, except for the last one, also check that they didn't copy the line after the workout
    //} else
    if (line.match(/[0-9]+$/) || (lines.length === 0 && ['Comment', 'Prop', 'Share'].indexOf(line) === -1 )) {
      setData = {};
      if (line.match(/\(PR\)/)) {
        setData.pr = true;
      }
      if (line.match(/reps/)) {
        match = line.match(/([0-9.]+) (lb|kg)/);
        if (match) {
          setData.weight = Number(match[1]);
          setData.unit = match[2];
        }
        match = line.match(/([0-9]+) reps/);
        if (match) {
          setData.reps = Number(match[1]);
        }
        if (line.match(/assisted/)) {
          setData.weight = setData.weight * -1;
        }
        if (setData.weight === 0) {
          delete setData.weight;
        }
        parsed[currentIndex].sets.push(setData);
      }
      else if (line.indexOf(':') > -1) { //Time/Distance
        match = line.match(/([0-9:]+) \| ([0-9]+) (mi|km)/);
        if (match) {
          setData.unit = match[3];
          setData.time = match[1];
          setData.distance = Number(match[2]);
          parsed[currentIndex].sets.push(setData);
        }
      }
      else if (parsed[currentIndex]) {
        parsed[currentIndex].comment = line;
      }
    }
    else if (['Comment', 'Prop', 'Share'].indexOf(line) === -1 ) {
      if (line.length > 1 && lines[0].match(/[0-9]/)) {
        currentIndex = currentIndex + 1;
        currentActivity = line;
        parsed[currentIndex] = { name: currentActivity, sets: [] };
      }
      else {
        parsed[currentIndex].comment = line;
      }
    }
  }
  return parsed;
};
