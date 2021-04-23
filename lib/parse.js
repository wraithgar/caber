'use strict'

const DISTANCEUNITS = /^[0-9.]+ ?(mi|kilom|km)\*?/
const TIMEUNITS = /^[0-9.]* ?(min|minutes|hour|hours)\*?$/
const TIMEEXPR = /^[0-9:]+\*?$/
const LIFTEXPR = /^-?[0-9.Xx]+(kg|lb)?(X|x)?[0-9Xx]?\*?$/
const LINESEP = /[\n]+[\s]*/
const WORDSEP = /[\s,]+/
const PREXPR = /\*$/
const COMMENTSTART = /^\(/
const COMMENTEND = /\)$/

// Returns true if the line appears to have an activity in it
const hasActivity = function (line) {
  let result = false
  let comment = false
  const words = line.split(WORDSEP)
  words.forEach(function (word) {
    if (word.match(/^\(/)) {
      comment = true
    } else if (!comment && (word.search(TIMEUNITS) === -1 && word.search(/[^\-0-9Xx:]/) > -1)) {
      result = true
    } else if (word.match(/\)$/)) {
      comment = false
    }
  })
  return result
}

const parseTimeUnits = function (time) {
  let seconds = Number(time.replace(/[^0-9.]/g, ''))
  if (time.search(/min/) > -1) {
    seconds = seconds * 60
  } else {
    seconds = seconds * 3600
  }
  return seconds
}

const parseSeconds = function (time) {
  const parts = time.split(':')
  let seconds = 0
  let part
  while (parts.length > 0) {
    part = parts.shift()
    seconds = Number(part) + (seconds * 60)
  }
  return seconds
}

const parseTime = function (time) {
  if (time.search(TIMEUNITS) > -1) {
    return parseTimeUnits(time)
  }
  return parseSeconds(time)
}

const clean = function (line) {
  return line.replace(/ ?(kg|lb)?x ?/i, '$1x')
    .replace(/ (min|minutes|hour|hours)/, '$1')
    .replace(/ (km|kilometers|kilometer|mi|mile|miles)/, '$1')
}

module.exports = function parse (data, unit) {
  let currentActivity
  let currentLine
  let currentSet
  let currentWord
  let lastType
  let pr
  let setIndex
  let sets
  let words
  let currentIndex = -1
  let commentBlock = false
  let set = []
  const parsed = []
  if (typeof data !== 'string') {
    throw new TypeError('Caber can only parse strings, tried parsing ' + typeof data)
  }

  unit = unit || 'lb'

  if (unit !== 'lb' && unit !== 'kg') {
    throw new TypeError('Invalid unit. Must be \'lb\' or \'kg\'')
  }

  const lines = data.split(LINESEP)

  while (lines.length > 0) {
    currentLine = lines.shift()
    if (currentLine.slice(-1) === '.') {
      currentLine = currentLine.slice(0, -1)
    }
    if (hasActivity(currentLine)) {
      // This line has a new activity on it, so we move on from the last one
      currentIndex = currentIndex + 1
      parsed[currentIndex] = { name: '', sets: [] }
      currentActivity = parsed[currentIndex]
    }
    words = clean(currentLine).split(WORDSEP)
    while (words.length > 0) {
      currentWord = words.shift()
      if (currentWord.match(COMMENTSTART) && currentIndex > -1) {
        commentBlock = true
        currentActivity.comment = currentWord.slice(1)
        if (currentWord.match(COMMENTEND)) {
          commentBlock = false
          currentActivity.comment = currentActivity.comment.slice(0, -1)
        }
      } else if (commentBlock) {
        currentActivity.comment = currentActivity.comment + ' ' + currentWord
        if (currentWord.match(COMMENTEND)) {
          commentBlock = false
          currentActivity.comment = currentActivity.comment.slice(0, -1)
        }
      } else if (currentWord.match(TIMEUNITS)) {
        if (currentWord.match(PREXPR)) {
          currentWord = currentWord.slice(0, -1)
          pr = true
        } else {
          pr = false
        }
        if (!lastType || lastType === 'time') {
          currentSet = { time: parseTime(currentWord) }
          currentActivity.sets.push(currentSet)
        } else {
          currentSet.time = parseTime(currentWord)
        }
        if (pr) {
          currentSet.pr = true
        }
        lastType = 'time'
      } else if (currentWord.match(TIMEEXPR) && currentWord.match(/:/)) {
        if (currentWord.match(PREXPR)) {
          pr = true
          currentWord = currentWord.slice(0, -1)
        } else {
          pr = false
        }
        if (!lastType || lastType === 'time') {
          currentSet = { time: parseTime(currentWord) }
          currentActivity.sets.push(currentSet)
        } else {
          currentSet.time = parseTime(currentWord)
        }
        if (pr) {
          currentSet.pr = true
        }
        lastType = 'time'
      } else if (currentWord.match(DISTANCEUNITS)) {
        if (!lastType || lastType === 'distance') {
          currentSet = { distance: Number(currentWord.match(/[0-9.]+/)[0]) }
          currentActivity.sets.push(currentSet)
        } else {
          currentSet.distance = Number(currentWord.match(/[0-9.]+/)[0])
        }
        if (currentWord.indexOf('mi') > -1) {
          currentSet.unit = 'miles'
        } else {
          currentSet.unit = 'kilometers'
        }
        if (currentWord.match(PREXPR)) {
          currentSet.pr = true
        }
        lastType = 'distance'
      } else if (currentWord.match(LIFTEXPR) && currentActivity) {
        if (currentWord.match(PREXPR)) {
          pr = true
          currentWord = currentWord.slice(0, -1)
        } else {
          pr = false
        }
        set = currentWord.split('x')
        sets = set[2] || 1
        for (setIndex = 0; setIndex < sets; setIndex++) {
          if (set[1]) {
            if (set[0].toLowerCase().match(/lb/)) {
              currentActivity.sets.push({ weight: Number(set[0].replace(/lb/, '')), reps: Number(set[1]), unit: 'lb' })
            } else if (set[0].toLowerCase().match(/kg/)) {
              currentActivity.sets.push({ weight: Number(set[0].replace(/kg/, '')), reps: Number(set[1]), unit: 'kg' })
            } else if (Number(set[0]) !== 0) {
              currentActivity.sets.push({ weight: Number(set[0]), reps: Number(set[1]), unit: unit })
            } else {
              currentActivity.sets.push({ reps: Number(set[1]) })
            }
          } else {
            currentActivity.sets.push({ reps: Number(set[0]) })
          }
        }
        if (pr) {
          currentActivity.sets[currentActivity.sets.length - 1].pr = true
        }
      } else if (currentWord && currentActivity && currentActivity.name) {
        currentActivity.name = currentActivity.name + ' ' + currentWord
      } else if (currentWord && currentActivity) {
        currentActivity.name = currentWord
      }
    }
  }
  return parsed
}
