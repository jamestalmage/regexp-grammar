var factory = options.factory;
if (!factory) {
  throw new Error('no factory specified');
}
var flags = options.flags || {};
var fromCodePoint = String.fromCodePoint || options.fromCodePoint;
var characterClassEscape = factory.characterClassEscape || defaultCharacterClassEscape;

function codePointAt(str, at) {
  if (!str) error('codePointAt: str cannot be undefined');
  if (str.codePointAt) {
    return str.codePointAt(at);
  }
  return options.codePointAt(str, at);
}

function defaultCharacterClassEscape(c) {
  var invert = c === c.toUpperCase();
  c = c.toLowerCase();
  return factory.charSet(unicodeSymbolSets[c].slice(), invert);
}
