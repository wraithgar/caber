# caber

String parsing library for logging workouts.

### Use

Pass it a string and it will attempt to parse it into a standardized
object for storing information about your workout.  By default weight
will be interpreted as lbs


```javascript
var caber = require('caber');

var workout = caber.parse('Squat 135x5, 200x3, 225x4. Bench Press 100x9x4 Cycling 1:30:00 15 miles (No wind)');

console.log('workout');
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
        { "time": "1:30:00", "distance": 15, "unit": "miles" }
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


If you use fitocracy you can copy and paste from that site and pass it
to `fitocracy`, it mostly works (cardio stuff generally doesn't)

```javascript
var caber = require('caber');

var pasteFromFitocracy = 'Gartracked Workout for 1000ptsOct 9, 2014\nCurls\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\n15 lb x 10 reps 11\nHammer Curls\n135 lb x 10 reps 25\n135 lb x 10 reps 25\n135 lb x 10 reps 25\n135lb x 10 reps 25\nDB Curls\n25 lb x 10 reps 57\n25 lb x 10 reps 57\n25 lb x 10 reps (PR) 57';
var workout = caber.fitocracy(pasteFromFitocracy);

console.log('workout');
```

This would output

```json
[
  {
    "name": "Curls",
    "sets": [
        { "weight": 15, "unit": "lb", "reps": 10 },
        { "weight": 15, "unit": "lb", "reps": 10 },
        { "weight": 15, "unit": "lb", "reps": 10 },
        { "weight": 15, "unit": "lb", "reps": 10 },
        { "weight": 15, "unit": "lb", "reps": 10 }
    ],
  }, {
    "name": "Hammer Curls",
    "sets": [
        { "weight": 135, "unit": "lb", "reps": 10 },
        { "weight": 135, "unit": "lb", "reps": 10 },
        { "weight": 135, "unit": "lb", "reps": 10 }
        { "reps": 10 }
     ]
  }, {
    "name": "DB Curls",
    "sets": [
        { "weight": 25, "unit": "lb", "reps": 10 },
        { "weight": 25, "unit": "lb", "reps": 10 },
        { "pr": true, "weight": 25, "unit": "lb", "reps": 10 }
     ]
  }
]
```
