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

  var b = require('../types').builders;
  var charSet = b.charSet.bind(b);
  var characterRange = function(min, max) {
    if ('string' === typeof min) {
      min = charSet([min]);
    }
    if ('string' === typeof max) {
      max = charSet([max]);
    }
    return b.characterRange(min, max);
  };
  var invertCharSet = b.invertCharSet.bind(b);
  var charSetUnion = b.charSetUnion.bind(b);
  var charSetMatcher = b.charSetMatcher.bind(b);
  var backReferenceMatcher = b.backReferenceMatcher.bind(b);
  var lineStartAssertion = b.lineStartAssertion.bind(b);
  var lineEndAssertion = b.lineEndAssertion.bind(b);
  var wordBoundaryAssertion = b.wordBoundaryAssertion.bind(b);
  var assertionMatcher = b.assertionMatcher.bind(b);
  var repeatMatcher = b.repeatMatcher.bind(b);
  var alternativeMatcher = b.alternativeMatcher.bind(b);
  var emptyMatcher = b.emptyMatcher.bind(b);
  var disjunctionMatcher = b.disjunctionMatcher.bind(b);
  var groupMatcher = b.groupMatcher.bind(b); /*  */

  var options = {factory: b};

  var spy;

  beforeEach(function() {
    spy = sinon.spy();
  });

  it('groups', function() {
    assert.deepEqual(
      parser.Pattern('(a|b)+\\1', options),
      alternativeMatcher(
        repeatMatcher(groupMatcher(
          disjunctionMatcher(
            alternativeMatcher(
              charSetMatcher(charSet(['a']), false),
              emptyMatcher()
            ),
            alternativeMatcher(
              charSetMatcher(charSet(['b']), false),
              emptyMatcher()
            )
          )
        ), 1, Number.POSITIVE_INFINITY, true),
        alternativeMatcher(
          backReferenceMatcher(1),
          emptyMatcher()
        )
      )
    );

    //does not create a group if it's not capturing
    assert.deepEqual(
      parser.Pattern('(?:a|b)+', options),
      alternativeMatcher(
        repeatMatcher(
          disjunctionMatcher(
            alternativeMatcher(
              charSetMatcher(charSet(['a']), false),
              emptyMatcher()
            ),
            alternativeMatcher(
              charSetMatcher(charSet(['b']), false),
              emptyMatcher()
            )
          )
        , 1, Number.POSITIVE_INFINITY, true),
          emptyMatcher()
      )
    );
  });

  it('Disjunction', function() {
    assert.deepEqual(
      parser.Disjunction('a|b', options),
      disjunctionMatcher(
        alternativeMatcher(
          charSetMatcher(charSet(['a']), false),
          emptyMatcher()
        ),
        alternativeMatcher(
          charSetMatcher(charSet(['b']), false),
          emptyMatcher()
        )
      )
    );

    assert.deepEqual(
      parser.Disjunction('ab|cd', options),
      disjunctionMatcher(
        alternativeMatcher(
          charSetMatcher(charSet(['a']), false),
          alternativeMatcher(
            charSetMatcher(charSet(['b']), false),
            emptyMatcher()
          )
        ),
        alternativeMatcher(
          charSetMatcher(charSet(['c']), false),
          alternativeMatcher(
            charSetMatcher(charSet(['d']), false),
            emptyMatcher()
          )
        )
      )
    );
  });

  it('Alternative', function() {
    assert.deepEqual(
      parser.Alternative('a', options),
      alternativeMatcher(
        charSetMatcher(charSet(['a']), false),
        emptyMatcher()
      )
    );

    assert.deepEqual(
      parser.Alternative('ab', options),
      alternativeMatcher(
        charSetMatcher(charSet(['a']), false),
        alternativeMatcher(
          charSetMatcher(charSet(['b']), false),
          emptyMatcher()
        )
      )
    );
  });

  it('Term', function() {
    assert.deepEqual(
      parser.Term('^', options),
      assertionMatcher(lineStartAssertion())
    );

    assert.deepEqual(
      parser.Term('a+', options),
      repeatMatcher(
        charSetMatcher(charSet(['a']), false),
        1, Number.POSITIVE_INFINITY, true
      )
    );

    assert.deepEqual(
      parser.Term('a{3,5}?', options),
      repeatMatcher(
        charSetMatcher(charSet(['a']), false),
        3, 5, false
      )
    );
  });

  it('Assertion', function() {
    assert.deepEqual(
      parser.Assertion('^', options),
      lineStartAssertion()
    );

    assert.deepEqual(
      parser.Assertion('$', options),
      lineEndAssertion()
    );

    assert.deepEqual(
      parser.Assertion('\\b', options),
      wordBoundaryAssertion(false)
    );

    assert.deepEqual(
      parser.Assertion('\\B', options),
      wordBoundaryAssertion(true)
    );

    //TODO: lookAhead versions
  });

  it('Quantifier', function() {
    assert.deepEqual(
      parser.Quantifier('*'),
      [0, Number.POSITIVE_INFINITY, true]
    );

    assert.deepEqual(
      parser.Quantifier('*?'),
      [0, Number.POSITIVE_INFINITY, false]
    );

    assert.deepEqual(
      parser.Quantifier('+'),
      [1, Number.POSITIVE_INFINITY, true]
    );

    assert.deepEqual(
      parser.Quantifier('?'),
      [0, 1, true]
    );

    assert.deepEqual(
      parser.Quantifier('??'),
      [0, 1, false]
    );

    assert.deepEqual(
      parser.Quantifier('{3}'),
      [3, 3, true]
    );

    assert.deepEqual(
      parser.Quantifier('{3,5}'),
      [3, 5, true]
    );

    assert.deepEqual(
      parser.Quantifier('{3,5}?'),
      [3, 5, false]
    );

    assert.deepEqual(
      parser.Quantifier('{4,}'),
      [4, Number.POSITIVE_INFINITY, true]
    );

    assert.deepEqual(
      parser.Quantifier('{4,}?'),
      [4, Number.POSITIVE_INFINITY, false]
    );
  });

  it('Atom', function() {
    assert.deepEqual(
      parser.Atom('a', options),
      charSetMatcher(charSet(['a']), false)
    );

    assert.deepEqual(
      parser.Atom('.', options),
      charSetMatcher(invertCharSet(
        charSet(['\u000A', '\u000D', '\u2028', '\u2029'])
      ), false)
    );

    assert.deepEqual(
      parser.Atom('\\1', options),
      backReferenceMatcher(1)
    );

    assert.deepEqual(
      parser.Atom('\\0', options),
      charSetMatcher(charSet(['\u0000']), false)
    );

    assert.deepEqual(
      parser.Atom('\\f', options),
      charSetMatcher(charSet(['\f']), false)
    );

    assert.deepEqual(
      parser.Atom('\\d', options),
      charSetMatcher(charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']), false)
    );
  });

  it('AtomEscape', function() {
    assert.deepEqual(
      parser.AtomEscape('1', options),
      backReferenceMatcher(1)
    );

    assert.deepEqual(
      parser.AtomEscape('0', options),
      charSetMatcher(charSet(['\u0000']), false)
    );

    assert.deepEqual(
      parser.AtomEscape('f', options),
      charSetMatcher(charSet(['\f']), false)
    );

    assert.deepEqual(
      parser.AtomEscape('d', options),
      charSetMatcher(charSet(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']), false)
    );
  });

  it('CharacterClass', function() {
    assert.deepEqual(
      parser.CharacterClass('[ab]', options),
      [
        charSetUnion(charSet(['a']), charSet(['b'])), false
      ]
    );
    assert.deepEqual(
      parser.CharacterClass('[ac-f]', options),
      [
        charSetUnion(charSet(['a']), characterRange('c', 'f')), false
      ]
    );
    assert.deepEqual(
      parser.CharacterClass('[c-f]', options),
      [
        characterRange('c', 'f'), false
      ]
    );
    assert.deepEqual(
      parser.CharacterClass('[a-b-c]', options),
      [
        charSetUnion(
          characterRange('a', 'b'),
          charSetUnion(charSet(['-']), charSet(['c']))
        )
        , false
      ]
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
