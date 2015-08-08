var fs = require('fs');
var unicode = require('./unicode-character-sets');
var path = require('path');

var grammarPath = path.resolve(__dirname, 'grammar_header.pegjs');
var outputPath = path.resolve(__dirname, 'grammar.pegjs');

var header = fs.readFileSync(grammarPath);

fs.writeFileSync(outputPath, [
  header,
  'UnicodeLetter =\n  ' + unicode.unicodeLetter,
  'UnicodeCombiningMark =\n   ' + unicode.unicodeCombiningMark,
  'UnicodeDigit =\n  ' + unicode.unicodeDigit,
  'UnicodeConnectorPunctuation =\n  ' + unicode.unicodeConnectorPunctuation
].join('\n\n'));

console.log('hello!');

