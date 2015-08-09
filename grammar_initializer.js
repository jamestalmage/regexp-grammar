var factory = options.factory;
if (!factory) {
  throw new Error('no factory specified');
}
var flags = options.flags || {};
var fromCodePoint = String.fromCodePoint || options.fromCodePoint;
var characterClassEscape = factory.characterClassEscape || defaultCharacterClassEscape;

function codePointAt(str, at) {
  at = at || 0;
  if (!str) error('codePointAt: str cannot be undefined');
  if (str.codePointAt) {
    return str.codePointAt(at);
  }
  return options.codePointAt(str, at);
}

function defaultCharacterClassEscape(c) {
  var invert = c === c.toUpperCase();
  c = c.toLowerCase();
  var set = charSet(unicodeSymbolSets[c].slice());
  if (invert) {
    set = invertCharSet(set)
  }
  return set;
}

function characterRange(min, max) {
  if (factory.characterRange) {
    return factory.characterRange(min, max);
  }
  var members = [];
  min = codePointAt(min);
  max = codePointAt(max);
  for (var i = min; i <= max; i++) {
    members.push(fromCodePoint(i));
  }
  return charSet(members, false);
}

function charSet(members) {
  return factory.charSet(members, false);
}

function charSet1(c) {
  return charSet([c]);
}

function charSet2(a, b) {
  if (b === undefined) {
    return a;
  }
  return charSet([a, b]);
}

function invertCharSet(c) {
  return factory.invertCharSet(c);
}

function characterClass(a, invert) {
  return factory.characterClass(a, invert);
}
