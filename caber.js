// Caber.js
// (c) 2014 Michael Garvin
// Caber may be freely distributed under the MIT license.
//
(function () {
    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Create a safe reference to the Caber object for use below.
    var Caber = function (obj) {
        if (obj instanceof Caber) {
            return obj;
        }
        if (!(this instanceof Caber)){
            return new Caber(obj);
        }
    };

    Caber.unit = 'lb';

    // Export Caber for node.js or browser
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Caber;
        }
        exports.Caber = Caber;
    } else {
        root.Caber = Caber;
    }

    //Main parser
    Caber.parse = function (data) {
        var set, sets, setData, buffer, nextWord, currentActivity, newActivity, activityInfo, pr;
        var parsed = {};
        if (typeof data !== 'string') {
            throw new TypeError('Caber can only parse strings, tried parsing ' + typeof data);
        }
        buffer = data.split(/[\s,\n]+/);

        while (buffer.length > 0) {
            nextWord = buffer.shift();
            if (nextWord.replace(/[^\w]+/g, '').replace(/[0-9Xx]+/g, '').length > 0) { //Number
                if (currentActivity && !newActivity) {
                    currentActivity = currentActivity + ' ' + nextWord;
                } else {
                    currentActivity = nextWord;
                }
                newActivity = false;
            } else if (currentActivity) {
                if (buffer.length > 1 && buffer[0].toLowerCase() === 'x') { //If the next word is 'x' and there's more after that
                    nextWord = nextWord + buffer.shift() + buffer.shift();
                } else if (buffer.length > 0 && nextWord.slice(-1).toLowerCase() === 'x') { // if we have more data and currently end in x
                    nextWord = nextWord + buffer.shift();
                } else if (buffer.length > 0 && buffer[0].slice(0, 1).toLowerCase() === 'x') { // if the next word starts with x
                    nextWord = nextWord + buffer.shift();
                }
                if (!parsed[currentActivity]) {
                    parsed[currentActivity] = [];
                }
                newActivity = true;
                if (nextWord.indexOf(':') > -1) {
                    sets = 1;
                    activityInfo = [nextWord];
                } else if (nextWord === '') {
                    sets = 0;
                } else {
                    if (nextWord.slice(-1) === '*') {
                        pr = true;
                        nextWord = nextWord.slice(0, -1);
                    } else {
                        pr = false;
                    }
                    activityInfo = nextWord.toLowerCase().replace(/[^0-9x:]+/g, '').split('x');
                    sets = activityInfo[2] || 1;
                }
                for (set = 0; set < sets; set++) {
                    setData = {};
                    if (activityInfo.length === 1) {
                        if (activityInfo[0].indexOf(':') > -1) {
                            setData.time = activityInfo[0];
                            if (buffer.length > 1 && ['miles', 'mi', 'kilometers', 'km', 'miles*', 'mi*', 'kilometers*', 'km*'].indexOf(buffer[1]) > -1) { //If the word after next is a distance
                                setData.distance = Number(buffer.shift());
                                setData.unit = buffer.shift();
                                if (setData.unit.slice(-1) === '*') {
                                    pr = true;
                                    setData.unit = setData.unit.slice(0, -1);
                                }
                            }
                        } else {
                            setData.reps = Number(activityInfo[0]);
                        }
                    } else {
                        setData.unit = 'lb';
                        setData.weight = Number(activityInfo[0]);
                        setData.reps = Number(activityInfo[1]);
                    }
                    parsed[currentActivity].push(setData);
                }
                if (pr) {
                    parsed[currentActivity][parsed[currentActivity].length -1].pr = true;
                }
            }
        }
        return parsed;
    };

    //Parse from copied fitocracy data
    Caber.fitocracy = function (data) {
        var lines, line, currentActivity, setData, match;
        var parsed = {};
        if (typeof data !== 'string') {
            throw new TypeError('Caber can only parse strings, tried parsing ' + typeof data);
        }
        lines = data.split(/\n/);

        while (lines.length > 0) {
            line = lines.shift();
            if (line.match(/tracked ?Workout ?for ?[0-9]+ ?pts/)) {
                //Header, ignore for now, use as title when we add title
            //Sets always end with a number in points, except for the last one, also check that they didn't copy the line after the workout
            } else if (line.match(/[0-9]+$/) || (lines.length === 0 && ['Comment', 'Prop', 'Share'].indexOf(line) === -1 )) {
                setData = {};
                if (line.match(/\(PR\)/)) {
                    setData.pr = true;
                }
                if (line.match(/reps/)) {
                    match = line.match(/([0-9]+) (lb|kg)/);
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
                    parsed[currentActivity].push(setData);
                } else if (line.indexOf(':') > -1) { //Time/Distance
                    match = line.match(/([0-9:]+) \| ([0-9]+) (mi|km)/);
                    if (match) {
                        setData.unit = match[3];
                        setData.time = match[1];
                        setData.distance = Number(match[2]);
                        parsed[currentActivity].push(setData);
                    }
                }
            } else if (line.length > 0 && ['Comment', 'Prop', 'Share'].indexOf(line) === -1 ) {
                currentActivity = line;
                parsed[currentActivity] = [];
            }
        }
        return parsed;
    };

}).call(this);

//TODO Strip leading/trailing punctuation from activity name
