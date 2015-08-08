var regenerate = require('regenerate');

/*
UnicodeLetter ::
  any character in the Unicode categories
    “Uppercase letter (Lu)”,
    “Lowercase letter (Ll)”,
    “Titlecase letter (Lt)”,
    “Modifier letter (Lm)”,
    “Other letter (Lo)”, or
    “Letter number (Nl)”.
*/
var unicodeLetter = regenerate()
  .add(require('unicode-3.0.1/categories/Lu/code-points'))
  .add(require('unicode-3.0.1/categories/Ll/code-points'))
  .add(require('unicode-3.0.1/categories/Lt/code-points'))
  .add(require('unicode-3.0.1/categories/Lm/code-points'))
  .add(require('unicode-3.0.1/categories/Lo/code-points'))
  .add(require('unicode-3.0.1/categories/Nl/code-points'));

/*
UnicodeCombiningMark ::
  any character in the Unicode categories
    “Non-spacing mark (Mn)” or
    “Combining spacing mark (Mc)”
*/
var unicodeCombiningMark = regenerate()
  .add(require('unicode-3.0.1/categories/Mn/code-points'))
  .add(require('unicode-3.0.1/categories/Mc/code-points'));

var unicodeDigit = regenerate()
  .add(require('unicode-3.0.1/categories/Nd/code-points'));

var unicodeConnectorPunctuation = regenerate()
  .add(require('unicode-3.0.1/categories/Pc/code-points'));


module.exports = {
  unicodeLetter : unicodeLetter,
  unicodeCombiningMark: unicodeCombiningMark,
  unicodeDigit: unicodeDigit,
  unicodeConnectorPunctuation: unicodeConnectorPunctuation
};
