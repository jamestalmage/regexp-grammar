'use strict';
describe('grammar', function() {
  var sinon = require('sinon');
  var assert = require('assert');
  var makeGrammar = require('../make-grammar');
  var makeParser = require('../make-parser');
  var parser = makeParser(makeGrammar.sync(), {allRules:true});

  var spy;

  beforeEach(function() {
    spy = sinon.spy();
  });

  it('DecimalDigits', function() {
    assert.equal(3, parser.DecimalDigits('3'));
    assert.equal(4, parser.DecimalDigits('4'));
    assert.equal(44, parser.DecimalDigits('44'));
    assert.equal(0, parser.DecimalDigits('0'));
  });

  it('DecimalIntegerLiteral', function() {
    assert.equal(3, parser.DecimalIntegerLiteral('3'));
    assert.equal(4, parser.DecimalIntegerLiteral('4'));
    assert.equal(44, parser.DecimalIntegerLiteral('44'));
    assert.equal(0, parser.DecimalIntegerLiteral('0'));
  });

  it('UnicodeEscapeSequence', function() {
    assert.equal('\u1234', parser.UnicodeEscapeSequence('u1234'));
    assert.equal('\u0067', parser.UnicodeEscapeSequence('u0067'));
  });

  it('HexEscapeSequence', function() {
    assert.equal('\x67', parser.HexEscapeSequence('x67'));
    assert.equal('\x04', parser.HexEscapeSequence('x04'));
  });


});
