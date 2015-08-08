var fs = require('fs');
var unicode = require('./unicode-character-sets');
var path = require('path');

var headerPath = path.resolve(__dirname, 'grammar_header.pegjs');

function makeGrammar(cb) {
  fs.readFile(headerPath, function(err, header) {
    if (err) return cb(err);
    cb(null, _makeGrammar(header));
  });
}

function makeGrammarSync() {
  var header = fs.readFileSync(headerPath);
  return _makeGrammar(header);
}

function _makeGrammar(header) {
  return [ header,
    'UnicodeLetter =\n  ' + unicode.unicodeLetter,
    'UnicodeCombiningMark =\n   ' + unicode.unicodeCombiningMark,
    'UnicodeDigit =\n  ' + unicode.unicodeDigit,
    'UnicodeConnectorPunctuation =\n  ' + unicode.unicodeConnectorPunctuation
  ].join('\n\n');
}

module.exports = makeGrammar;
module.exports.sync = makeGrammarSync;
