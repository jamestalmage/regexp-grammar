var fs = require('fs');
var unicode = require('./unicode-character-sets');
var unicodeSymbols = require('./unicode-symbols');
var path = require('path');

var headerPath = path.resolve(__dirname, 'grammar_header.pegjs');
var initializerPath = path.resolve(__dirname, 'grammar_initializer.js');

function makeGrammarSync() {
  var header = fs.readFileSync(headerPath);
  var initializer = fs.readFileSync(initializerPath);
  //console.log( _makeGrammar(initializer, header));
  return _makeGrammar(initializer, header);
}

function _makeGrammar(initializer, header) {
  return [
    '{',
    [
      'var unicodeSymbolSets = ' + unicodeSymbols,
      initializer
    ].join(';\n'),
    '}',
    header,
    'UnicodeLetter =\n  ' + unicode.unicodeLetter,
    'UnicodeCombiningMark =\n   ' + unicode.unicodeCombiningMark,
    'UnicodeDigit =\n  ' + unicode.unicodeDigit,
    'UnicodeConnectorPunctuation =\n  ' + unicode.unicodeConnectorPunctuation
  ].join('\n\n');
}

//module.exports = makeGrammar;
module.exports = makeGrammarSync;
