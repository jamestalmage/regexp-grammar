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

function stripInitializer(grammarSource) {
  var i = 0;
  while (/^\s$/.test(grammarSource.charAt(i))) {
    i++;
  }
  var count = grammarSource.charAt(i) === '{' ? 1 : 0;

  while ((++i) < grammarSource.length && count > 0) {
    var c = grammarSource.charAt(i);
    if (c === '{') count++;
    if (c === '}') count--;
  }
  return grammarSource.substring(i);
}

function allRules(grammarSource) {
  return stripInitializer(grammarSource).match(/(?:^|\r?\n)\s*\w+\s*=/g).map(function(value) {
    return value.substring(0, value.length-1).trim();
  });
}

function makeParser(grammarSource, options) {
  assert.equal(options.output || 'parser', 'parser');

  var parser = PEG.buildParser(grammarSource, options);

  options.allowedStartRules.forEach(function(startRule) {
    parser[startRule] = function(s, parserOptions) {
      parserOptions = parserOptions || {};
      parserOptions.startRule = startRule;
      if (options.fakeFactory && !parserOptions.factory) {
        parserOptions.factory = {};
      }
      return parser.parse(s, parserOptions);
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
    var shortcutSource = 'module.exports.' +
      startRule +
      ' = function(s, parserOptions) { ' +
      'parserOptions = parserOptions || {};';

    if (options.fakeFactory) {
      shortcutSource += 'if (!parserOptions.factory) {' +
          'parserOptions.factory = {};' +
      '}'
    }

    shortcutSource += 'parserOptions.startRule = "' + startRule + '";' +
      'return module.exports.parse(s, parserOptions);' +
      '}';
    parserSource.push(shortcutSource);
  });

  return parserSource.join(';\n');
}
