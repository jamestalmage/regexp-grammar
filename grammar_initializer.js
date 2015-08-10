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
  if (c === '.') {
    return invertCharSet(charSet(unicodeSymbolSets.lineTerminator.slice()))
  }
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

function invertCharSet(c) {
  return factory.invertCharSet(c);
}

function charSetUnion(a, b) {
  if (b === undefined) {
    return a;
  }
  return factory.charSetUnion(a, b);
}

function backReferenceMatcher(reference) {
  return factory.backReferenceMatcher(reference);
}

function charSetMatcher(charSet, invert) {
  return factory.charSetMatcher(charSet, invert);
}

function lineStartAssertion() {
  return factory.lineStartAssertion();
}

function lineEndAssertion() {
  return factory.lineEndAssertion();
}

function wordBoundaryAssertion(invert) {
  return factory.wordBoundaryAssertion(invert);
}

function lookAheadAssertion(disjunction, invert) {
  return factory.lookAheadAssertion(disjunction, invert);
}

function assertionMatcher(assertion) {
  return factory.assertionMatcher(assertion);
}

function repeatMatcher(matcher, min, max, greedy) {
  return factory.repeatMatcher(matcher, min, max, greedy);
}
