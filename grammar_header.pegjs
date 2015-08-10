Pattern
  = Disjunction

Disjunction
  = l: Alternative '|' r: Disjunction { return disjunctionMatcher(l, r); }
  / Alternative

Alternative
  = t:Term a:Alternative { return alternativeMatcher(t, a); }
  / '' { return emptyMatcher(); }

Term
  = a:Assertion { return assertionMatcher(a); }
  / m:Atom q:Quantifier { return repeatMatcher(m, q[0], q[1], q[2]); }
  / Atom

Assertion
  = '^' { return lineStartAssertion(); }
  / '$' { return lineEndAssertion(); }
  / '\\b' { return wordBoundaryAssertion(false); }
  / '\\B' { return wordBoundaryAssertion(true); }
  / '(?=' d:Disjunction ')' { return lookAheadAssertion(d, false); }
  / '(?!' d:Disjunction ')' { return lookAheadAssertion(d, true); }

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
  = c:PatternCharacter { return charSetMatcher(charSet1(c), false); }
  / '.' { return charSetMatcher(characterClassEscape('.'), false); }
  / '\\' m:AtomEscape { return m; }
  / c:CharacterClass { return charSetMatcher(c[0], c[1]); }
  / '(' d:Disjunction ')' { return groupMatcher(d); }
  / '(?:' d:Disjunction ')' { return d; }

PatternCharacter
  = [^^$\\.*+?()[\]{}|]

AtomEscape
  = d:DecimalEscape {
    if (typeof d === 'string') {
      return charSetMatcher(charSet1(d), false);
    }
    return backReferenceMatcher(d);
  }
  / d:CharacterEscape { return charSetMatcher(charSet1(d), false); }
  / d:CharacterClassEscape { return charSetMatcher(d, false); }

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
  = a:ClassAtom '-' b:ClassAtom c:ClassRanges { return charSetUnion(characterRange(a,b), c); }
  / a:ClassAtom b:NonemptyClassRangesNoDash { return charSetUnion(a,b); }
  / ClassAtom

NonemptyClassRangesNoDash
  = a:ClassAtomNoDash '-' b:ClassAtom c:ClassRanges { return charSetUnion(characterRange(a,b), c); }
  / a:ClassAtomNoDash b:NonemptyClassRangesNoDash { return charSetUnion(a,b); }
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
