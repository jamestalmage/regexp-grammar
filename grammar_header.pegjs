Pattern
  = Disjunction

Disjunction
  = Alternative '|' Disjunction
  / Alternative

Alternative
  = Term Alternative
  / Term
  / /*empty*/

Term
  = Assertion
  / Atom
  / Atom Quantifier

Assertion
  = '^'
  / '$'
  / '\\b'
  / '\\B'
  / '(?=' Disjunction ')'
  / '(?!' Disjunction ')'

Quantifier
  = QuantifierPrefix
  / QuantifierPrefix '?'

QuantifierPrefix
  = '*'
  / '+'
  / '?'
  / '{' DecimalDigits '}'
  / '{' DecimalDigits ',}'
  / '{' DecimalDigits ',' DecimalDigits '}'

Atom
  = PatternCharacter
  / '.'
  / '\\' AtomEscape
  / CharacterClass
  / '(' Disjunction ')'
  / '(?:' Disjunction ')'

PatternCharacter
  = [^^$\\.*+?()[\]{}|]

AtomEscape
  = DecimalEscape
  / CharacterEscape
  / CharacterClassEscape

CharacterEscape
  = ControlEscape
  / 'c' ControlLetter
  / HexEscapeSequence
  / UnicodeEscapeSequence
  / IdentityEscape

ControlEscape
  = [fnrtv]

ControlLetter
  = [a-zA-Z]

IdentityEscape
  = !IdentifierPart .
  / ZWJ
  / ZWNJ

DecimalEscape
  = DecimalIntegerLiteral !DecimalDigit

CharacterClassEscape
  = [dDsSwW]

CharacterClass
  = '[^' ClassRanges ']'
  / '[' ClassRanges ']'

ClassRanges
  = NonemptyClassRanges
  / /*empty*/

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
  = 'x' HexDigit HexDigit

UnicodeEscapeSequence
  = 'u' HexDigit HexDigit HexDigit HexDigit

HexDigit
  = [0-9a-fA-F]

ZWJ
  = '\u200D'

ZWNJ
  = '\u200C'

LineTerminator
  = '\u000A'
  / '\u000D'
  / '\u2028'
  / '\u2028'

LineTerminatorSequence
  = '\u000A'
  / '\u000D\u000A'
  / '\u000D'
  / '\u2028'
  / '\u2029'

DecimalIntegerLiteral
  = '0'
  / NonZeroDigit DecimalDigits?

DecimalDigits
  = DecimalDigit DecimalDigits
  / DecimalDigit

DecimalDigit
  = [0-9]

NonZeroDigit
  = [1-9]
/*

zero width non-joiner  <ZWNJ> \u200C
zero width joiner       <ZWJ> \u200D
byte order marker       <BOM> \uFEFF


*/
