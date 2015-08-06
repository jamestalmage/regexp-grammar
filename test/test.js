'use strict';
var assert = require('assert');
var regexpGrammar = require('../');

describe('regexp-grammar', function() {

  it('should', function() {
    assert.equal(regexpGrammar('unicorns'), 'unicorns & rainbows');
  });

});
