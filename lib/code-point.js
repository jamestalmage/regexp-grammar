module.exports = make;

function make(codePointAt) {
  codePointAt = codePointAt || function (s, i) { return s.codePointAt(i); };

  return function codePoint(char) {
    if ('number' === typeof char) {
      return char;
    }
    return codePointAt(char, 0);
  }
}
