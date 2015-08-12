'use strict';

describe('optimize-charset', function() {
  var types = require('../lib/types');
  var optimize = require('../lib/optimize-charset');
  var assert = require('assert');
  var b = types.builders;

  it('CharacterRanges should have max and min replaced with String values', function() {
    assert.deepEqual(
      optimize(b.characterRange(b.charSet(['a']), b.charSet(['d']))),
      b.characterRange('a', 'd')
    );
  });

  it('reduces sequential characters into a range', function() {
    assert.deepEqual(
      optimize(b.charSet(['a', 'b', 'c', 'e', 'g', 'h', 'k'])),
      b.charSetUnion([
        b.characterRange('a', 'c'),
        'e',
        b.characterRange('g', 'h'),
        'k'
      ], false)
    );

    assert.deepEqual(
      optimize(b.charSet(['a', 'c', 'd'], true)),
      b.charSetUnion([
        'a',
        b.characterRange('c', 'd')
      ], true)
    );

    var original = b.charSet(['a', 'd', 'f']);
    assert.strictEqual(
      optimize(original),
      original
    );
  });

  xit('overlapping ranges are joined', function() {
    assert.deepEqual(
      optimize(b.charSetUnion([
        b.characterRange('a', 'f'),
        b.characterRange('e', 'm')
      ])),
      b.characterRange('a', 'm')
    )

  });

});
