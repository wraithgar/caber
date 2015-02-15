// Caber.js
// (c) 2014 Michael Garvin
// Caber may be freely distributed under the MIT license.
//
;(function () {
    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    var distanceUnits = /(mi|kilometer|km)/;

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
        var currentIndex = -1;
        var currentComment = false;
        var parsed = [];
        if (typeof data !== 'string') {
            throw new TypeError('Caber can only parse strings, tried parsing ' + typeof data);
        }
        buffer = data.split(/[\s,\n]+/);

        while (buffer.length > 0) {
            nextWord = buffer.shift();
            if (currentComment || nextWord.replace(/[^\w]+/g, '').replace(/[0-9Xx]+/g, '').length > 0) {
                if (nextWord.match(/^\(/) && currentIndex > -1) {
                    newActivity = true;
                    if (nextWord.match(/\)$/)) {
                        parsed[currentIndex].comment = nextWord.slice(1, -1);
                    } else {
                        currentComment = true;
                        parsed[currentIndex].comment = nextWord.slice(1);
                    }
                } else if (nextWord.match(/\)$/) && currentComment) {
                    currentComment = false;
                    parsed[currentIndex].comment = parsed[currentIndex].comment + ' ' + nextWord.slice(0, -1);
                } else if (currentIndex > -1 && currentComment) {
                    parsed[currentIndex].comment = parsed[currentIndex].comment + ' ' + nextWord;
                } else if (currentActivity && !newActivity) {
                    parsed[currentIndex].name = parsed[currentIndex].name + ' ' + nextWord;
                } else {
                    currentIndex = currentIndex + 1;
                    currentActivity = nextWord;
                    parsed[currentIndex] = {name: currentActivity, sets: []};
                    newActivity = false;
                }
            } else if (currentActivity) {
                if (buffer.length > 1 && buffer[0].toLowerCase() === 'x') { //If the next word is 'x' and there's more after that
                    nextWord = nextWord + buffer.shift() + buffer.shift();
                } else if (buffer.length > 0 && nextWord.slice(-1).toLowerCase() === 'x') { // if we have more data and currently end in x
                    nextWord = nextWord + buffer.shift();
                } else if (buffer.length > 0 && buffer[0].slice(0, 1).toLowerCase() === 'x') { // if the next word starts with x
                    nextWord = nextWord + buffer.shift();
                }
                newActivity = true;
                pr = false;
                if (nextWord.indexOf(':') > -1) {
                    sets = 1;
                    activityInfo = [nextWord];
                } else if (nextWord === '') {
                    sets = 0;
                } else {
                    if (nextWord.slice(-1) === '*') {
                        pr = true;
                        nextWord = nextWord.slice(0, -1);
                    }
                    activityInfo = nextWord.toLowerCase().replace(/[^0-9x:.]+/g, '').split('x');
                    sets = activityInfo[2] || 1;
                }
                for (set = 0; set < sets; set++) {
                    setData = {};
                    if (activityInfo.length === 1) {
                        if (activityInfo[0].indexOf(':') > -1) {
                            setData.time = activityInfo[0];
                            if (buffer.length > 0 && buffer[0].search(/^.?[0-9]/) > -1 && buffer[0].search(distanceUnits) > -1) { //If the next word has a distance unit
                                setData.distance = Number(buffer[0].match(/^([0-9.]+)/)[0]);
                                if (buffer[0].indexOf('mi') > -1) {
                                    setData.unit = 'miles';
                                } else {
                                    setData.unit = 'kilometers';
                                }
                            } else if (buffer.length > 1 && buffer[1].search(distanceUnits) > -1) { //If the word after next is a distance
                                setData.distance = Number(buffer.shift());
                                setData.unit = buffer.shift();
                                if (setData.unit.slice(-1) === '*') {
                                    pr = true;
                                    setData.unit = setData.unit.slice(0, -1);
                                }
                                if (setData.unit.indexOf('kilometer') === 0 || setData.unit === 'km') {
                                    setData.unit = 'kilometers';
                                } else if (setData.unit.indexOf('mi') === 0) {
                                    setData.unit = 'miles';
                                }
                            }
                        } else {
                            setData.reps = Number(activityInfo[0]);
                        }
                    } else {
                        setData.unit = 'lb';
                        setData.weight = Number(activityInfo[0]);
                        setData.reps = Number(activityInfo[1]);
                        if (setData.weight === 0) {
                            delete setData.weight;
                        }
                    }
                    parsed[currentIndex].sets.push(setData);
                }
                if (pr) {
                    parsed[currentIndex].sets[parsed[currentIndex].sets.length -1].pr = true;
                }
            }
        }
        return parsed;
    };

    //Parse from copied fitocracy data
    Caber.fitocracy = function (data) {
        var lines, line, currentActivity, setData, match;
        var currentIndex = -1;
        var parsed = [];
        if (typeof data !== 'string') {
            throw new TypeError('Caber can only parse strings, tried parsing ' + typeof data);
        }
        lines = data.split(/\n/);

        while (lines.length > 0) {
            line = lines.shift();
            if (line.match(/tracked ?[\w ]\+ ?for ?[0-9]+ ?pts/)) {
                //Header, ignore for now, use as title when we add title
            //Sets always end with a number in points, except for the last one, also check that they didn't copy the line after the workout
            } else if (line.match(/[0-9]+$/) || (lines.length === 0 && ['Comment', 'Prop', 'Share'].indexOf(line) === -1 )) {
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
                } else if (line.indexOf(':') > -1) { //Time/Distance
                    match = line.match(/([0-9:]+) \| ([0-9]+) (mi|km)/);
                    if (match) {
                        setData.unit = match[3];
                        setData.time = match[1];
                        setData.distance = Number(match[2]);
                        parsed[currentIndex].sets.push(setData);
                    }
                } else if (parsed[currentIndex]) {
                    parsed[currentIndex].comment = line;
                }
            } else if (['Comment', 'Prop', 'Share'].indexOf(line) === -1 ) {
                if (line.length > 1 && lines[0].match(/[0-9]/)) {
                    currentIndex = currentIndex + 1;
                    currentActivity = line;
                    parsed[currentIndex] = {name: currentActivity, sets: []};
                } else {
                    parsed[currentIndex].comment = line;
                }
            }
        }
        return parsed;
    };

}).call(this);
