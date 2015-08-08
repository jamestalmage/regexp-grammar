'use strict';
describe('grammar', function() {
  var sinon = require('sinon');
  var assert = require('assert');
  var makeGrammar = require('../make-grammar');
  var makeParser = require('../make-parser');
  var parser = makeParser(makeGrammar(), {
    allRules: true,
    fakeFactory: true
  });

  var spy;

  beforeEach(function() {
    spy = sinon.spy();
  });

  it('DecimalEscape', function() {
    assert.strictEqual('\u0000', parser.DecimalEscape('0'));
    assert.strictEqual(1, parser.DecimalEscape('1'));
    assert.strictEqual(2, parser.DecimalEscape('2'));
    assert.strictEqual(23, parser.DecimalEscape('23'));
  });

  it('ClassEscape', function() {
    function charSet(members, invert) {
      return {
        type: 'CharSet',
        members: members,
        invert: invert
      };
    }
    var options = {factory: {charSet: charSet}};

    assert.deepEqual(
      parser.ClassEscape('0', options),
      charSet(['\u0000'], false)
    );

    assert.throws(function(){
      parser.ClassEscape('1', options);
    });

    assert.deepEqual(
      parser.ClassEscape('b', options),
      charSet(['\u0008'], false)
    );

    assert.deepEqual(
      parser.ClassEscape('f', options),
      charSet(['\f'], false)
    );

    assert.deepEqual(
      parser.ClassEscape('cm', options),
      charSet(['\r'], false)
    );

    assert.deepEqual(
      parser.ClassEscape('cJ', options),
      charSet(['\n'], false)
    );

    assert.deepEqual(
      parser.ClassEscape('d', options),
      charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], false)
    );

    assert.deepEqual(
      parser.ClassEscape('D', options),
      charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], true)
    );
  });

  it('DecimalDigits', function() {
    assert.strictEqual(3, parser.DecimalDigits('3'));
    assert.strictEqual(4, parser.DecimalDigits('4'));
    assert.strictEqual(44, parser.DecimalDigits('44'));
    assert.strictEqual(0, parser.DecimalDigits('0'));
  });

  it('DecimalIntegerLiteral', function() {
    assert.strictEqual(3, parser.DecimalIntegerLiteral('3'));
    assert.strictEqual(4, parser.DecimalIntegerLiteral('4'));
    assert.strictEqual(44, parser.DecimalIntegerLiteral('44'));
    assert.strictEqual(0, parser.DecimalIntegerLiteral('0'));
  });

  it('ControlEscape', function() {
    assert.strictEqual('\f', parser.ControlEscape('f'));
    assert.strictEqual('\n', parser.ControlEscape('n'));
    assert.strictEqual('\r', parser.ControlEscape('r'));
    assert.strictEqual('\t', parser.ControlEscape('t'));
    assert.strictEqual('\v', parser.ControlEscape('v'));
  });

  it('ControlLetter', function() {
    assert.strictEqual('\u0001', parser.ControlLetter('a'));
    assert.strictEqual('\u0002', parser.ControlLetter('b'));
    assert.strictEqual('\u0002', parser.ControlLetter('B'));
    assert.strictEqual('\n', parser.ControlLetter('j'));
    assert.strictEqual('\r', parser.ControlLetter('m'));
  });

  it('HexEscapeSequence', function() {
    assert.strictEqual('\x67', parser.HexEscapeSequence('x67'));
    assert.strictEqual('\x04', parser.HexEscapeSequence('x04'));
  });

  it('UnicodeEscapeSequence', function() {
    assert.strictEqual('\u1234', parser.UnicodeEscapeSequence('u1234'));
    assert.strictEqual('\u0067', parser.UnicodeEscapeSequence('u0067'));
  });

  it('IdentityEscape', function() {
    assert.strictEqual(' ', parser.IdentityEscape(' '));
    assert.strictEqual('&', parser.IdentityEscape('&'));
    assert.strictEqual('"', parser.IdentityEscape('"'));
    assert.strictEqual("'", parser.IdentityEscape("'"));
  });

  describe('CharacterEscape', function() {
    it('ControlEscape', function() {
      assert.strictEqual('\f', parser.CharacterEscape('f'));
      assert.strictEqual('\n', parser.CharacterEscape('n'));
      assert.strictEqual('\r', parser.CharacterEscape('r'));
      assert.strictEqual('\t', parser.CharacterEscape('t'));
      assert.strictEqual('\v', parser.CharacterEscape('v'));
    });

    it('ControlLetter', function() {
      assert.strictEqual('\u0001', parser.CharacterEscape('ca'));
      assert.strictEqual('\u0002', parser.CharacterEscape('cb'));
      assert.strictEqual('\u0002', parser.CharacterEscape('cB'));
      assert.strictEqual('\n', parser.CharacterEscape('cj'));
      assert.strictEqual('\r', parser.CharacterEscape('cm'));
    });

    it('HexEscapeSequence', function() {
      assert.strictEqual('\x67', parser.CharacterEscape('x67'));
      assert.strictEqual('\x04', parser.CharacterEscape('x04'));
    });

    it('UnicodeEscapeSequence', function() {
      assert.strictEqual('\u1234', parser.CharacterEscape('u1234'));
      assert.strictEqual('\u0067', parser.CharacterEscape('u0067'));
    });

    it('IdentityEscape', function() {
      assert.strictEqual(' ', parser.CharacterEscape(' '));
      assert.strictEqual('&', parser.CharacterEscape('&'));
      assert.strictEqual('"', parser.CharacterEscape('"'));
      assert.strictEqual("'", parser.CharacterEscape("'"));
    });
  });
});
