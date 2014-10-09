// Caber.js
// (c) 2014 Michael Garvin
// Ambit may be freely distributed under the MIT license.
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
        var rep, buffer, nextWord, currentActivity, newActivity, weightReps;
        var parsed = {};
        if (typeof data !== 'string') {
            throw new Error('Caber can only parse strings, tried parsing ' + typeof data);
        }
        buffer = data.split(/\s+/);

        while (buffer.length > 0) {
            nextWord = buffer.shift();
            if (nextWord.replace(/[^\w]+/g, '').replace(/[0-9Xx]+/g, '').length > 0) {
                if (currentActivity && !newActivity) {
                    currentActivity = currentActivity + ' ' + nextWord;
                } else {
                    currentActivity = nextWord;
                }
                newActivity = false;
            } else {
                if (!parsed[currentActivity]) {
                    parsed[currentActivity] = [];
                }
                newActivity = true;
                weightReps = nextWord.toLowerCase().replace(/[^0-9x]+/g, '').split('x');
                for (rep = 0; rep < (weightReps[2] || 1); rep++) {
                    parsed[currentActivity].push({unit: 'lb', weight: Number(weightReps[0]), reps: Number(weightReps[1])});
                }
            }
        }
        return parsed;
    };

}).call(this);
