var PEG = require('pegjs');
var assert = require('assert');

module.exports = main;
module.exports.allRules = allRules;

function main(grammarSource, options) {
  options = options || {};

  if (options.allRules) {
    options.allowedStartRules = allRules(grammarSource);
  } else if (!options.allowedStartRules) {
    options.allowedStartRules = ['Pattern'];
  }

  if (options.output === 'source') {
    return makeSource(grammarSource, options);
  }

  return makeParser(grammarSource, options);
}

function allRules(grammarSource) {
  return grammarSource.match(/(?:^|\r?\n)\s*\w+\s*=/g).map(function(value) {
    return value.substring(0, value.length-1).trim();
  });
}

function makeParser(grammarSource, options) {
  assert.equal(options.output || 'parser', 'parser');

  var parser = PEG.buildParser(grammarSource, options);

  options.allowedStartRules.forEach(function(startRule) {
    parser[startRule] = function(s) {
      return parser.parse(s, {startRule:startRule});
    };
  });

  return parser;
}

function makeSource(grammarSource, options) {
  assert.equal(options.output, 'source');

  var parserSource = [
    'module.exports = ' + PEG.buildParser(grammarSource, options)
  ];

  options.allowedStartRules.forEach(function(startRule) {
    parserSource.push(
      'module.exports.' +
      startRule +
      ' = function(s) { return module.exports.parse(s, {startRule: "' +
      startRule + '"});}'
    )
  });

  return parserSource.join(';\n');
}
