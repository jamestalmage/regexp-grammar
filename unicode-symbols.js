var USP = require('unicode-3.0.1/categories/Zs/symbols');

var WhiteSpace = [
  '\u0009',
  '\u000B',
  '\u000C',
  '\u0020',
  '\u00A0',
  '\uFEFF'
].concat(USP);

var LineTerminator = [
  '\u000A',
  '\u000D',
  '\u2028',
  '\u2029'
];

var i;
var d = [];
var w = [];

for (i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
  w.push(String.fromCharCode(i));
}
for (i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
  w.push(String.fromCharCode(i));
}
for (i = 0; i < 10; i++) {
  d.push('' + i);
  w.push('' + i);
}

w.push('_');

function unique(arr) {
  var cache = Object.create(null);
  return arr.filter(function(value) {
    var ret = !cache[value];
    cache[value] = true;
    return ret;
  });
}

var output = JSON.stringify({
  s: unique(WhiteSpace.concat(LineTerminator)),
  d: d,
  w: w,
  lineTerminator: LineTerminator
}, null, 2);


output = output.replace(/\u2028/g, '\\u2028');
output = output.replace(/\u2029/g, '\\u2029');

module.exports = output;
