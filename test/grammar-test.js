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

  function charSet(members) {
    return {
      type: 'CharSet',
      members: members,
      invert: false
    };
  }

  function validateRangeArg(min, name) {
    if ('string' === typeof min) {
      assert.equal(1, min.length);
      return min;
    }
    assert.equal(min.type, 'CharSet', name + '.type');
    assert.equal(min.members.length, 1, name + '.length');
    assert.equal(typeof min.members[0], 'string', name + '.type');
    return min.members[0];
  }

  function characterRange(min, max) {
    return {
      type: 'CharacterRange',
      min: validateRangeArg(min, 'min'),
      max: validateRangeArg(max, 'max')
    };
  }

  function charSetUnion(a, b) {
    return {
      type: 'CharSetUnion',
      a: a,
      b: b
    };
  }

  function invertCharSet(c) {
    var c2 = charSet(c.members);
    c2.invert = !c.invert;
    return c2;
  }

  function characterClass(charSet, invert) {
    return {
      type: 'CharacterClass',
      charSet: charSet,
      invert: invert
    }
  }

  var options = {factory: {
    charSet: charSet,
    characterRange: characterRange,
    invertCharSet: invertCharSet,
    characterClass: characterClass,
    charSetUnion: charSetUnion
  }};

  var spy;

  beforeEach(function() {
    spy = sinon.spy();
  });

  it('CharacterClass', function() {
    assert.deepEqual(
      parser.CharacterClass('[ab]', options),
      characterClass(
        charSetUnion(charSet(['a']), charSet(['b'])), false
      )
    );
    assert.deepEqual(
      parser.CharacterClass('[ac-f]', options),
      characterClass(
        charSetUnion(charSet(['a']), characterRange('c', 'f')), false
      )
    );
    assert.deepEqual(
      parser.CharacterClass('[c-f]', options),
      characterClass(
        characterRange('c', 'f'), false
      )
    );
    assert.deepEqual(
      parser.CharacterClass('[a-b-c]', options),
      characterClass(
        charSetUnion(
          characterRange('a', 'b'),
          charSetUnion(charSet(['-']), charSet(['c']))
        )
        , false
      )
    );
  });

  it('NonemptyClassRangesNoDash', function() {
    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('a-b', options),
      characterRange('a','b')
    );

    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('-', options),
      charSet(['-'])
    );

    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('a', options),
      charSet(['a'])
    );

    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('b', options),
      charSet(['b'])
    );

    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('0', options),
      charSet(['0'])
    );

    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('\\0', options),
      charSet(['\u0000'])
    );

    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('\\f', options),
      charSet(['\f'])
    );

    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('\\d', options),
      charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    );

    assert.deepEqual(
      parser.NonemptyClassRangesNoDash('\\D', options),
      invertCharSet(charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']))
    );
  });

  it('ClassAtom', function() {
    assert.deepEqual(
      parser.ClassAtom('-', options),
      charSet(['-'])
    );

    assert.deepEqual(
      parser.ClassAtom('a', options),
      charSet(['a'])
    );

    assert.deepEqual(
      parser.ClassAtom('b', options),
      charSet(['b'])
    );

    assert.deepEqual(
      parser.ClassAtom('0', options),
      charSet(['0'])
    );

    assert.deepEqual(
      parser.ClassAtom('\\0', options),
      charSet(['\u0000'])
    );

    assert.deepEqual(
      parser.ClassAtom('\\f', options),
      charSet(['\f'])
    );

    assert.deepEqual(
      parser.ClassAtom('\\d', options),
      charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    );

    assert.deepEqual(
      parser.ClassAtom('\\D', options),
      invertCharSet(charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']))
    );
  });

  it('ClassAtomNoDash', function() {
    assert.deepEqual(
      parser.ClassAtomNoDash('a', options),
      charSet(['a'])
    );

    assert.deepEqual(
      parser.ClassAtomNoDash('b', options),
      charSet(['b'])
    );

    assert.deepEqual(
      parser.ClassAtomNoDash('0', options),
      charSet(['0'])
    );

    assert.deepEqual(
      parser.ClassAtomNoDash('\\0', options),
      charSet(['\u0000'])
    );

    assert.deepEqual(
      parser.ClassAtomNoDash('\\f', options),
      charSet(['\f'])
    );

    assert.deepEqual(
      parser.ClassAtomNoDash('\\d', options),
      charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    );

    assert.deepEqual(
      parser.ClassAtomNoDash('\\D', options),
      invertCharSet(charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']))
    );
  });

  it('ClassEscape', function() {
    assert.deepEqual(
      parser.ClassEscape('0', options),
      charSet(['\u0000'])
    );

    assert.throws(function(){
      parser.ClassEscape('1', options);
    });

    assert.deepEqual(
      parser.ClassEscape('b', options),
      charSet(['\u0008'])
    );

    assert.throws(function(){
      parser.ClassEscape('B', options);
    });

    assert.deepEqual(
      parser.ClassEscape('f', options),
      charSet(['\f'])
    );

    assert.deepEqual(
      parser.ClassEscape('cm', options),
      charSet(['\r'])
    );

    assert.deepEqual(
      parser.ClassEscape('cJ', options),
      charSet(['\n'])
    );

    assert.deepEqual(
      parser.ClassEscape('d', options),
      charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    );

    assert.deepEqual(
      parser.ClassEscape('D', options),
      invertCharSet(charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']))
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

  it('DecimalEscape', function() {
    assert.strictEqual('\u0000', parser.DecimalEscape('0'));
    assert.strictEqual(1, parser.DecimalEscape('1'));
    assert.strictEqual(2, parser.DecimalEscape('2'));
    assert.strictEqual(23, parser.DecimalEscape('23'));
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
