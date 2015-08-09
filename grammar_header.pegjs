Pattern
  = Disjunction

Disjunction
  = left: Alternative '|' right: Disjunction { return factory.disjunction(left, right); }
  / Alternative

Alternative
  = term:Term alternative:Alternative { return factory.alternative(term, alternative); }
  / term:Term { return factory.alternative(term, null); }
  / '' { return factory.alternative(null, null); }

Term
  = Assertion
  / Atom Quantifier
  / Atom

Assertion
  = '^' { return factory.lineStartAssertion(!!flags.multiline); }
  / '$' { return factory.lineEndAssertion(!!flags.multiline); }
  / '\\b' { return factory.wordBoundaryAssertion(false); }
  / '\\B' { return factory.wordBoundaryAssertion(true); }
  / '(?=' disjunction:Disjunction ')' { return factory.lookAheadAssertion(disjunction, false); }
  / '(?!' disjunction:Disjunction ')' { return factory.lookAheadAssertion(disjunction, true); }

Quantifier
  = range:QuantifierPrefix '?' { return {range: range, greedy: false}; }
  / range:QuantifierPrefix { return {range: range, greedy: true}; }

QuantifierPrefix
  = '*' { return [0, null]; }
  / '+' { return [1, null]; }
  / '?' { return [0, 1]; }
  / '{' n:DecimalDigits ',' m:DecimalDigits '}' { return [n, m]; }
  / '{' n:DecimalDigits ',}' { return [n, null]; }
  / '{' n:DecimalDigits '}' { return [n, n]; }

Atom
  = PatternCharacter
  / '.' { return factory.any(); }
  / '\\' e: AtomEscape { return e; }
  / CharacterClass
  / '(' d:Disjunction ')' { return factory.group(d, true); }
  / '(?:' d:Disjunction ')' { return factory.group(d, false); }

PatternCharacter
  = c:[^^$\\.*+?()[\]{}|] { return factory.patternCharacter(c); }

AtomEscape
  = DecimalEscape
  / CharacterEscape
  / CharacterClassEscape

CharacterEscape
  = ControlEscape
  / 'c' c:ControlLetter { return c; }
  / HexEscapeSequence
  / UnicodeEscapeSequence
  / IdentityEscape

ControlEscape
  = 'f' { return '\f'; }
  / 'n' { return '\n'; }
  / 'r' { return '\r'; }
  / 't' { return '\t'; }
  / 'v' { return '\v'; }

ControlLetter
  = a:[a-zA-Z] { return fromCodePoint(a.charCodeAt(0) % 32); }

IdentityEscape
  = !IdentifierPart c:. { return c; }
  / ZWJ
  / ZWNJ

DecimalEscape
  = d:DecimalIntegerLiteral !DecimalDigit { return d === 0 ? '\u0000' : d };

CharacterClassEscape
  = c:[dDsSwW] { return characterClassEscape(c); }

CharacterClass
  = '[^' a:ClassRanges ']' { return characterClass(a, true); }
  / '[' a:ClassRanges ']' { return characterClass(a, false); }

ClassRanges
  = NonemptyClassRanges
  / '' { return; }

NonemptyClassRanges
  = a:ClassAtom '-' b:ClassAtom c:ClassRanges { return charSet2(characterRange(a,b), c); }
  / a:ClassAtom b:NonemptyClassRangesNoDash { return charSet2(a,b); }
  / ClassAtom

NonemptyClassRangesNoDash
  = a:ClassAtomNoDash '-' b:ClassAtom c:ClassRanges { return charSet2(characterRange(a,b), c); }
  / a:ClassAtomNoDash b:NonemptyClassRangesNoDash { return charSet2(a,b); }
  / ClassAtom

ClassAtom
  = '-' { return charSet1('-'); }
  / ClassAtomNoDash

ClassAtomNoDash
  = '\\' c:ClassEscape { return c; }
  / c:[^\\\]\-] { return charSet1(c); }

ClassEscape
  = d:DecimalEscape {
      if (typeof d !== 'string') {
        expected('"0" (or something else that escapes to a character)');
      }
      return charSet1(d);
    }
  / 'b' { return charSet1('\u0008'); }
  / c:CharacterEscape { return charSet1(c); }
  / CharacterClassEscape

IdentifierStart
  = UnicodeLetter
  / '$'
  / '_'
  / '\\' UnicodeEscapeSequence

IdentifierPart
  = IdentifierStart
  / UnicodeCombiningMark
  / UnicodeDigit
  / UnicodeConnectorPunctuation
  / ZWNJ
  / ZWJ

HexEscapeSequence
  = 'x' d:$(HexDigit HexDigit) { return String.fromCharCode(parseInt(d, 16)); }

UnicodeEscapeSequence
  = 'u' d:$(HexDigit HexDigit HexDigit HexDigit) { return fromCodePoint(parseInt(d, 16)); }

HexDigit
  = [0-9a-fA-F]

ZWJ
  = '\u200D'

ZWNJ
  = '\u200C'

DecimalIntegerLiteral
  = '0' { return 0; }
  / d:$(NonZeroDigit DecimalDigits?) { return parseInt(d, 10); }

DecimalDigits
  = d:$(DecimalDigit+) { return parseInt(d, 10); }

DecimalDigit
  = [0-9]

NonZeroDigit
  = [1-9]

/*
-LineTerminator
  = '\u000A'
  / '\u000D'
  / '\u2028'
  / '\u2028'

-LineTerminatorSequence
  = '\u000A'
  / '\u000D\u000A'
  / '\u000D'
  / '\u2028'
  / '\u2029'
*/
