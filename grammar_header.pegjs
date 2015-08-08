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
  / 'c' ControlLetter { return c; }
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
  = a:[a-zA-Z] { return fromCodePoint(a.toLowerCase().charCodeAt(0) - 96); }

IdentityEscape
  = !IdentifierPart .
  / ZWJ
  / ZWNJ

DecimalEscape
  = d:DecimalIntegerLiteral !DecimalDigit { return d === 0 ? '\u0000' : d };

CharacterClassEscape
  = [dDsSwW] { return characterClassEscape(); }

CharacterClass
  = '[^' ClassRanges ']'
  / '[' ClassRanges ']'

ClassRanges
  = NonemptyClassRanges
  / ''

NonemptyClassRanges
  = ClassAtom '-' ClassAtom ClassRanges
  / ClassAtom NonemptyClassRangesNoDash
  / ClassAtom

NonemptyClassRangesNoDash
  = ClassAtom
  / ClassAtomNoDash NonemptyClassRangesNoDash
  / ClassAtomNoDash '-' ClassAtom ClassRanges

ClassAtom
  = '-'
  / ClassAtomNoDash

ClassAtomNoDash
  = '\\' ClassEscape
  / [^\\\]\-]

ClassEscape
  = DecimalEscape
  / 'b'
  / CharacterEscape
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
