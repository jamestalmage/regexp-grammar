'use strict';

describe('range-list', function() {
  var RangeList = require('../lib/range-list');
  var assert = require('assert');
  var types = require('../lib/types');
  var b = types.builders;

  var list;

  function reset() {
    list = new RangeList();
  }

  beforeEach(reset);

  it('adding a single range', function() {
    list.add(b.characterRange('a', 'c'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'c')]
    );
  });

  it('add a few ranges', function() {
    list.add(b.characterRange('a', 'c'));
    list.add(b.characterRange('i', 'j'));
    list.add(b.characterRange('e', 'g'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'c'), b.characterRange('e', 'g'), b.characterRange('i', 'j')]
    );
  });

  it('adding a single char', function() {
    list.add('c');

    assert.deepEqual(
      list.getRanges(),
      ['c']
    );
  });

  it('adding a few chars', function() {
    list.add('e');
    list.add('a');
    list.add('c');

    assert.deepEqual(
      list.getRanges(),
      ['a', 'c', 'e']
    );
  });

  it('overlapping ranges will get combined', function() {
    list.add(b.characterRange('a', 'e'));
    list.add(b.characterRange('d', 'h'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'h')]
    );

    reset();

    list.add(b.characterRange('d', 'h'));
    list.add(b.characterRange('a', 'e'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'h')]
    );
  });

  it('joining two ranges with a third', function() {
    list.add(b.characterRange('a', 'e'));
    list.add(b.characterRange('g', 'k'));
    list.add(b.characterRange('d', 'i'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'k')]
    );
  });

  it('characters absorbed by ranges', function() {
    list.add(b.characterRange('a', 'e'));
    list.add('d');
    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'e')]
    );

    reset();
    list.add(b.characterRange('a', 'e'));
    list.add('d');
    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'e')]
    );
  });

  it('edge on are joined', function() {
    list.add(b.characterRange('a', 'c'));
    list.add(b.characterRange('c', 'f'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'f')]
    );

    reset();

    list.add(b.characterRange('c', 'f'));
    list.add(b.characterRange('a', 'c'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'f')]
    );
  });

  it('immediate neighbors', function() {
    list.add(b.characterRange('a', 'c'));
    list.add(b.characterRange('d', 'f'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'f')]
    );

    reset();

    list.add(b.characterRange('d', 'f'));
    list.add(b.characterRange('a', 'c'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'f')]
    );
  });

  it('immediate character neighbors', function() {
    list.add(b.characterRange('a', 'c'));
    list.add(b.characterRange('e', 'g'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'c'), b.characterRange('e', 'g')]
    );

    list.add('d');

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'g')]
    );
  });

  it('ranges absorbed by ranges', function() {
    list.add(b.characterRange('a', 'k'));
    list.add(b.characterRange('c', 'e'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'k')]
    );

    reset();

    list.add(b.characterRange('c', 'e'));
    list.add(b.characterRange('a', 'k'));

    assert.deepEqual(
      list.getRanges(),
      [b.characterRange('a', 'k')]
    );
  });

  it('absorb lots of stuff', function() {
    list.add('a');
    list.add('e');
    list.add('h');
    list.add('l');
    list.add('p');
    list.add('v');
    list.add('z');
    list.add(b.characterRange('f', 'u'));

    assert.deepEqual(
      list.getRanges(),
      ['a', b.characterRange('e', 'v'), 'z']
    );
  });
});
