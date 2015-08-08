var factory = options.factory;
if (!factory) {
  throw new Error('no factory specified');
}
var flags = options.flags || {};
var fromCodePoint = String.fromCodePoint || options.fromCodePoint;
var characterClassEscape = factory.characterClassEscape || defaultCharacterClassEscape;

function defaultCharacterClassEscape(c) {
  var invert = c === c.toUpperCase();
  c = c.toLowerCase();
  return factory.characterRange(unicodeSymbolSets[c].slice(), invert);
}
