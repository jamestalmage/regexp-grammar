var fs = require('fs');
var path = require('path');
var makeGrammar = require('./make-grammar');
var makeParser = require('./make-parser');

var grammarPath = path.resolve(__dirname, 'grammar.pegjs');
var parserPath = path.resolve(__dirname, 'parser.js');
var debugParserPath = path.resolve(__dirname, 'parser.debug.js');
var smallParserPath = path.resolve(__dirname, 'parser.small.js');

var grammarSource = makeGrammar();
fs.writeFileSync(grammarPath, grammarSource);

function output(path, options) {
  options = options || {};
  options.output = 'source';
  fs.writeFileSync(path, makeParser(grammarSource, options));
}

output(parserPath);

output(debugParserPath, {allRules: true, fakeFactory:true});

output(smallParserPath, {optimize: 'size'});
