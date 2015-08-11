var types = require('ast-types/lib/types');
var shared = require('./shared-types');
var defaults = require('ast-types/lib/shared').defaults;
var Type = types.Type;
var def = Type.def;
var or = Type.or;
var n = types.namedTypes;
var Character = shared.Character;
var SingleMemberCharSet = shared.SingleMemberCharSet;

def('CharSetBase')
  .field('invert', Boolean, defaults['false']);

def('CharSet')
  .bases('CharSetBase')
  .build('members', 'invert')
  .field('members', [Character]);

def('CharacterRange')
  .bases('CharSetBase')
  .build('min', 'max', 'invert')
  .field('min', or(Character, SingleMemberCharSet))
  .field('max', or(Character, SingleMemberCharSet));

def('CharSetUnion')
  .bases('CharSetBase')
  .build('members', 'invert')
  .field('members', [or(Character, def('CharSetBase'))]);

types.builders.invertCharSet = function(c) {
  n.CharSet.assert(c);
  var c2 = types.builders.charSet(c.members);
  c2.invert = !c.invert;
  return c2;
};

def('Matcher');

def('CharSetMatcher')
  .bases('Matcher')
  .build('charSet', 'invert')
  .field('charSet', def('CharSet'))
  .field('invert', Boolean);

def('BackReferenceMatcher')
  .bases('Matcher')
  .build('reference')
  .field('reference', Number);

def('Assertion');

def('LineStartAssertion')
  .bases('Assertion')
  .build();

def('LineEndAssertion')
  .bases('Assertion')
  .build();

def('WordBoundaryAssertion')
  .bases('Assertion')
  .build('invert')
  .field('invert', Boolean);

def('AssertionMatcher')
  .bases('Matcher')
  .build('assertion')
  .field('assertion', def('Assertion'));

def('RepeatMatcher')
  .bases('Matcher')
  .build('matcher', 'min', 'max', 'greedy')
  .field('matcher', def('Matcher'))
  .field('min', Number)
  .field('max', Number)
  .field('greedy', Boolean);

def('AlternativeMatcher')
  .bases('Matcher')
  .build('term', 'alternative')
  .field('term', def('Matcher'))
  .field('alternative', def('Matcher'));

def('EmptyMatcher')
  .bases('Matcher')
  .build();

def('DisjunctionMatcher')
  .bases('Matcher')
  .build('left', 'right')
  .field('left', def('Matcher'))
  .field('right', def('Matcher'));

def('GroupMatcher')
  .bases('Matcher')
  .build('matcher')
  .field('matcher', def('Matcher'));

module.exports = types;
