var b = options.factory;
if (!b) {
  throw new Error('no factory specified');
}
var fromCodePoint = String.fromCodePoint || options.fromCodePoint;
var characterClassEscape = b.characterClassEscape || defaultCharacterClassEscape;

function defaultCharacterClassEscape(c) {
  if (c === '.') {
    return b.invertCharSet(b.charSet(unicodeSymbolSets.lineTerminator.slice()))
  }
  var invert = c === c.toUpperCase();
  c = c.toLowerCase();
  var set = b.charSet(unicodeSymbolSets[c].slice());
  if (invert) {
    set = b.invertCharSet(set)
  }
  return set;
}

function charSetUnion(a, c) {
  if (c === undefined) {
    return a;
  }
  return b.charSetUnion([a, c]);
}
