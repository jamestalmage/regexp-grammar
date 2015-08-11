'use strict';
describe('copy-ast', function() {
  var types = require('../lib/types');
  var b = types.builders;
  var copyAST = require('../lib/copy-ast');
  var assert = require('assert');

  it('copies things', function() {
    var original = b.charSetUnion(b.charSet(['a', 'b']), b.charSet(['c', 'd']));
    var copy = copyAST(original);

    assert.notEqual(copy, original);
    assert.deepEqual(copy, original);
  });

  it('copies using custom builders', function() {
    var customBuilder = {
      charSetUnion: function (a, b) {
        return {a: a, b: b, type: 'CustomUnion'};
      },
      charSet: function (members) {
        return {members: members, type: 'CustomCharSet'};
      }
    };

    var original = b.charSetUnion(b.charSet(['a', 'b']), b.charSet(['c', 'd']));
    var copy = copyAST(original, customBuilder);

    assert.deepEqual(copy, {
      a: {members: ['a', 'b'], type: 'CustomCharSet'},
      b: {members: ['c', 'd'], type: 'CustomCharSet'},
      type: 'CustomUnion'
    });
  });

  it('throws errors if for some nonexistent type', function() {
    assert.throws(
      function() {
        copyAST({type: 'NonExistentType'});
      },
      /registered builder/
    );
  });

  it('throws if custom builder does not have the correct build Fn', function() {
    assert.throws(
      function() {
        copyAST(b.charSet(['a','b']), {});
      },
      /custom builder/
    );
  });

  it('throws if it gets an object without at "type" property', function() {
    assert.throws(
      function() {
        copyAST({})
      },
      /not an AST node/
    );
  });

  it('will not pass "undefined"', function() {
    var log = [];
    var customBuilder = {
      charSet: function() {
        log.push(Array.prototype.slice.call(arguments));
      }
    };
    copyAST({type: 'CharSet', members:['a']}, customBuilder);
    copyAST({type: 'CharSet', members:['a'], invert:false}, customBuilder);
    assert.deepEqual(log, [
      [['a']],
      [['a'], false]
    ]);
  });
});
