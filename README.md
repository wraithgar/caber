# caber

String parsing library for logging workouts.

[![Build Status](https://travis-ci.org/wraithgar/caber.svg?branch=master)](https://travis-ci.org/wraithgar/caber)
[![NSP Status](https://nodesecurity.io/orgs/wraithgar/projects/d7a06e6a-3544-4018-b28e-bdf72ec0a00c/badge)](https://nodesecurity.io/orgs/wraithgar/projects/d7a06e6a-3544-4018-b28e-bdf72ec0a00c)
[![Greenkeeper badge](https://badges.greenkeeper.io/wraithgar/caber.svg)](https://greenkeeper.io/)

### Use

Pass it a string and it will attempt to parse it into a standardized
object for storing information about your workout.  By default weight
will be interpreted as lbs

Use `parse` to parse activities only, or use `workout` to have caber try
to figure out a name and date for the workout. Date will be a [moment](http://momentjs.com/)
object.

By default weights are in lb but you can pass 'kg' as a second parameter
to `parse` to default to kg.


```javascript
var caber = require('caber');

var workout = caber.workout('Thursday Leg Day\nSquat 135x5, 200x3, 225x4.\nCycling 1:30:00 15 miles (No wind)');

console.log(workout);
```

This would output

```json
{
  "name": "Leg Day",
  "date": "(This will be a moment object)",
  "rawDate": "(This will be what the string that generated the date was)",
  "activities": [
    {
      "name": "Squat",
      "sets": [
          { "reps": 5, "weight": 135, "unit": "lb" },
          { "reps": 3, "weight": 200, "unit": "lb" },
          { "reps": 4, "weight": 225, "unit": "lb" }
      ]
    }, {
      "name": "Bench Press",
      "sets": [
          { "reps": 9, "weight": 100, "unit": "lb" },
          { "reps": 9, "weight": 100, "unit": "lb" },
          { "reps": 9, "weight": 100, "unit": "lb" },
          { "reps": 9, "weight": 100, "unit": "lb" }
      ]
    }, {
      "name": "Cycling",
      "sets": [
          { "time": 5400, "distance": 15, "unit": "miles" }
      ],
      "comment": "No wind"
    }
  ]
}
```

```javascript
var caber = require('caber');

var workout = caber.parse('Squat 135x5, 200x3, 225x4.\nBench Press 100x9x4\nCycling 1:30:00 15 miles (No wind)');

console.log(workout);
```

This would output

```json
[
  {
    "name": "Squat",
    "sets": [
        { "reps": 5, "weight": 135, "unit": "lb" },
        { "reps": 3, "weight": 200, "unit": "lb" },
        { "reps": 4, "weight": 225, "unit": "lb" }
    ]
  }, {
    "name": "Bench Press",
    "sets": [
        { "reps": 9, "weight": 100, "unit": "lb" },
        { "reps": 9, "weight": 100, "unit": "lb" },
        { "reps": 9, "weight": 100, "unit": "lb" },
        { "reps": 9, "weight": 100, "unit": "lb" }
    ]
  }, {
    "name": "Cycling",
    "sets": [
        { "time": 5400, "distance": 15, "unit": "miles" }
    ],
    "comment": "No wind"
  }
]
```

As you can see in that example, comments after sets can be put in
parenthesis to be found

If a given entry is a PR, end it with an asterisk (\*) and it will be
tagged as such

```javascript
var workout = caber.parse('Deadlift 450x5, 500x1*');
console.log(workout);
```

```json
[
  {
    "name": "Deadlift",
    "sets": [
        {"reps": 5, "weight": 450, "unit": "lb"},
        {"reps": 1, "weight": 500, "unit": "lb", "pr": true}
    ]
  }
]
```
