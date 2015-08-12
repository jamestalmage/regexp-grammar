'use strict';
module.exports = RangeList;
var types = require('./types');
var b = types.builders;
var n = types.namedTypes;
var CharSet = n.CharSet;
var CharacterRange = n.CharacterRange;

function RangeList (codePointAt) {
  var codePoint = require('./code-point')(codePointAt);

  var ranges = [];

  function add(range) {
    if (CharacterRange.check(range)) {
      range = {
        min: range.min,
        max: range.max
      }
    } else if (typeof range === 'string') {
      range = {
        min: range,
        max: range
      };
    }
    range.minCp = codePoint(range.min);
    range.maxCp = codePoint(range.max);

    var i = 0;
    var len = ranges.length;
    var minCp = range.minCp - 1;
    var iRange;
    while (i < len && minCp > (iRange = ranges[i]).maxCp) {
      i++;
    }
    if (i === len) {
      ranges.push(range);
      return;
    }
    var j = i;
    var maxCp = range.maxCp + 1;
    var jRange;
    while (j < len && maxCp > (jRange = ranges[j]).maxCp) {
      j++;
    }
    if (maxCp >= jRange.minCp) {
      j++;
    }
    if (j > i) {
      if (minCp >= iRange.minCp) {
        range.min = iRange.min;
        range.minCp = iRange.minCp;
      }

      if (maxCp <= jRange.maxCp) {
        range.max = jRange.max;
        range.maxCp = jRange.maxCp;
      }
    }
    ranges.splice(i, j - i , range);
  }

  function getRanges() {
    return ranges.map(function(range) {
      if (range.max === range.min) {
        return range.max;
      }
      return b.characterRange(range.min, range.max);
    });
  }

  return {
    add: add,
    getRanges: getRanges
  };
}
