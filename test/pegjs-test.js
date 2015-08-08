'use strict';
describe('blah', function() {
  var PEG = require('pegjs');
  var assert = require('assert');

  function eachPasses(parser) {
    for (var i = 1; i < arguments.length; i ++) {
      try {
        parser.parse(arguments[i]);
      } catch (e) {
        throw new Error(arguments[i] + ':' + e);
      }
    }
  }

  function eachFails(parser) {
    for (var i = 1; i < arguments.length; i ++) {
      try {
        parser.parse(arguments[i]);
      } catch (e) {
        continue;
      }
      throw new Error(arguments[i] + ': should have thrown');
    }
  }

  var notAorB = PEG.buildParser([
    'start = anything start / anything',
    'anything = $(NotAorB+) / $(AorB+)',
    'NotAorB = (!AorB).',
    'AorB = "a"i / "b"i'
  ].join('\n'));

  it('notAorB', function() {
    assert.deepEqual(notAorB.parse('c'), 'c');
    assert.deepEqual(notAorB.parse('cdcd'), 'cdcd');
    assert.deepEqual(notAorB.parse('abab'), 'abab');
    assert.deepEqual(notAorB.parse('ababc'), ['abab', 'c']);
  });

  it('not precedence', function() {
     var not = PEG.buildParser('start = !"a" .');

    not.parse('b');
    //not.parse('a');  // fails (which is correct)
  });

  it('unicode identifier', function() {
    assert.equal('\u0061', 'a');
    var \u0061bc = 'hello';
    assert.equal(abc, 'hello');
  });

  it('empty', function() {
    var empty = PEG.buildParser([
      'start = Disjunction',
      'Disjunction = Alternative "|" Disjunction / Alternative',
      'Alternative = Term Alternative / Term / /*empty*/',
      'Term = "a" / "b" / "c"'
    ].join('\n'));

    eachPasses(empty,
      'a',
      'b',
      'c',
      '|a',
      '|b',
      '|c',
      'a|',
      'b|',
      'c|',
      'c|a',
      'a|c',
      'a|c|b||');
  });

  it('not chars', function() {
    var notChars = PEG.buildParser(
      'start = [^^$\\\\.*+?()[\\]{}|]'
    );
    eachFails(notChars, '^', '$', '\\', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}', '|');
  });

  it ('LineTerminator', function() {
    var gtltChars = PEG.buildParser([
      'LineTerminator = LF / CR / LS / PS',
      'LF = "\\u000A"',
      'CR = "\\u000D"',
      'LS = "\\u2028"',
      'PS = "\\u2029"'
    ].join('\n'));
    eachPasses(gtltChars,
      '\r',
      '\n',
      '\u2028',
      '\u2029'
    );
  });

  it ('LineTerminatorSequence', function() {
    var gtltChars = PEG.buildParser([
      'LineTerminatorSequence',
        "= '\\u000A'",
        "/ '\\u000D\\u000A'",
        "/ '\\u000D'",
        "/ '\\u2028'",
        "/ '\\u2029'"
    ].join('\n'));
    eachPasses(gtltChars,
      '\r',
      '\n',
      '\r\n',
      '\u2028',
      '\u2029'
    );
  });

});
