var distanceUnits = /(mi|kilometer|km)/;
var timeUnits = /(min|minutes|hour|hours)/;

var parseTimeUnits = function (time) {
    var seconds = Number(time.replace(/[^0-9]/g, ''));
    if (time.search(/min/) > -1) {
        seconds = seconds * 60;
    } else {
        seconds = seconds * 3600;
    }
    return seconds;
};

var parseSeconds = function (time) {
    var parts = time.split(':');
    var seconds = 0;
    var part;
    while (parts.length > 0) {
        part = parts.shift();
        seconds = Number(part) + (seconds * 60);
    }
    return seconds;
};

var parseTime = function (time) {
    if (time.search(timeUnits) > -1) {
        return parseTimeUnits(time);
    }
    return parseSeconds(time);
};

module.exports = function parse(data) {
    var set, setCount, setData, buffer, nextWord, currentActivity, newActivity, activityInfo, pr;
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
        } else {
            //We need to see if we're part of a time:?unit activity
            console.log('nextWord', nextWord);
            if (!currentActivity) {
                if (buffer.length > 1 && buffer[0].search(timeUnits) > -1) { //time unit activity
                    currentIndex = currentIndex + 1;
                    nextWord = nextWord + buffer.shift();
                    currentActivity = buffer.shift();
                    parsed[currentIndex] = {name: currentActivity, sets: []};
                    newActivity = false;
                } else if (buffer.length > 0 && nextWord.search(/[^0-9:]/) === -1) { //time:unit activity
                    currentIndex = currentIndex + 1;
                    currentActivity = buffer.shift();
                    parsed[currentIndex] = {name: currentActivity, sets: []};
                    newActivity = false;
                }
            }
            if (currentActivity) {
                console.log(' currentActivity', currentActivity, buffer.length);
                if (buffer.length > 1 && buffer[0].toLowerCase() === 'x') { //If the next word is 'x' and there's more after that
                    nextWord = nextWord + buffer.shift() + buffer.shift();
                } else if (buffer.length > 0 && nextWord.slice(-1).toLowerCase() === 'x') { // if we have more data and currently end in x
                    nextWord = nextWord + buffer.shift();
                } else if (buffer.length > 0 && buffer[0].slice(0, 1).toLowerCase() === 'x') { // if the next word starts with x
                    nextWord = nextWord + buffer.shift();
                } else if (buffer.length > 0 && buffer[0].search(timeUnits) > -1) { //next word is a time unit
                    nextWord = nextWord + buffer.shift();
                }
                newActivity = true;
                pr = false;
                if (nextWord.indexOf(':') > -1 || nextWord.search(timeUnits) > -1 ) {
                    setCount = 1;
                    activityInfo = [nextWord];
                } else if (nextWord === '') {
                    setCount = 0;
                } else {
                    if (nextWord.slice(-1) === '*') {
                        pr = true;
                        nextWord = nextWord.slice(0, -1);
                    }
                    activityInfo = nextWord.toLowerCase().replace(/[^0-9x:.]+/g, '').split('x');
                    setCount = activityInfo[2] || 1;
                }
                for (set = 0; set < setCount; set++) {
                    setData = {};
                    if (activityInfo.length === 1) {
                        if (activityInfo[0].indexOf(':') > -1 || activityInfo[0].search(timeUnits) > -1 ) {
                            if (!setData.time) {
                                setData.time = parseTime(activityInfo[0]);
                            } else {
                                setData.time = setData.time + parseTime(activityInfo[0]);
                            }
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
    }
    return parsed;
};

