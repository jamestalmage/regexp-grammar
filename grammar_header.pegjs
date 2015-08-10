Pattern
  = Disjunction

Disjunction
  = l: Alternative '|' r: Disjunction { return b.disjunctionMatcher(l, r); }
  / Alternative

Alternative
  = t:Term a:Alternative { return b.alternativeMatcher(t, a); }
  / '' { return b.emptyMatcher(); }

Term
  = a:Assertion { return b.assertionMatcher(a); }
  / m:Atom q:Quantifier { return b.repeatMatcher(m, q[0], q[1], q[2]); }
  / Atom

Assertion
  = '^' { return b.lineStartAssertion(); }
  / '$' { return b.lineEndAssertion(); }
  / '\\b' { return b.wordBoundaryAssertion(false); }
  / '\\B' { return b.wordBoundaryAssertion(true); }
  / '(?=' d:Disjunction ')' { return b.lookAheadAssertion(d, false); }
  / '(?!' d:Disjunction ')' { return b.lookAheadAssertion(d, true); }

Quantifier
  = q:QuantifierPrefix '?' { q.push(false); return q; }
  / q:QuantifierPrefix { q.push(true); return q; }

QuantifierPrefix
  = '*' { return [0, Number.POSITIVE_INFINITY]; }
  / '+' { return [1, Number.POSITIVE_INFINITY]; }
  / '?' { return [0, 1]; }
  / '{' n:DecimalDigits ',' m:DecimalDigits '}' { return [n, m]; }
  / '{' n:DecimalDigits ',}' { return [n, Number.POSITIVE_INFINITY]; }
  / '{' n:DecimalDigits '}' { return [n, n]; }

Atom
  = c:PatternCharacter { return b.charSetMatcher(b.charSet([c]), false); }
  / '.' { return b.charSetMatcher(characterClassEscape('.'), false); }
  / '\\' m:AtomEscape { return m; }
  / c:CharacterClass { return b.charSetMatcher(c[0], c[1]); }
  / '(' d:Disjunction ')' { return b.groupMatcher(d); }
  / '(?:' d:Disjunction ')' { return d; }

PatternCharacter
  = [^^$\\.*+?()[\]{}|]

AtomEscape
  = d:DecimalEscape {
    if (typeof d === 'string') {
      return b.charSetMatcher(b.charSet([d]), false);
    }
    return b.backReferenceMatcher(d);
  }
  / d:CharacterEscape { return b.charSetMatcher(b.charSet([d]), false); }
  / d:CharacterClassEscape { return b.charSetMatcher(d, false); }

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
  = '[^' a:ClassRanges ']' { return [a, true]; }
  / '[' a:ClassRanges ']' { return [a, false]; }

ClassRanges
  = NonemptyClassRanges
  / '' { return; }

NonemptyClassRanges
  = a:ClassAtom '-' d:ClassAtom c:ClassRanges { return charSetUnion(b.characterRange(a,d), c); }
  / a:ClassAtom d:NonemptyClassRangesNoDash { return charSetUnion(a, d); }
  / ClassAtom

NonemptyClassRangesNoDash
  = a:ClassAtomNoDash '-' d:ClassAtom c:ClassRanges { return charSetUnion(b.characterRange(a,d), c); }
  / a:ClassAtomNoDash d:NonemptyClassRangesNoDash { return charSetUnion(a,d); }
  / ClassAtom

ClassAtom
  = '-' { return b.charSet(['-']); }
  / ClassAtomNoDash

ClassAtomNoDash
  = '\\' c:ClassEscape { return c; }
  / c:[^\\\]\-] { return b.charSet([c]); }

ClassEscape
  = d:DecimalEscape {
      if (typeof d !== 'string') {
        expected('"0" (or something else that escapes to a character)');
      }
      return b.charSet([d]);
    }
  / 'b' { return b.charSet(['\u0008']); }
  / c:CharacterEscape { return b.charSet([c]); }
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
