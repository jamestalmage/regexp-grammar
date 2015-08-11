var types = require('ast-types/lib/types');
var builtin = types.builtInTypes;
var isString = builtin.string;
var Type = types.Type;
var def = Type.def;

var SingleMemberCharSet = new Type(function(value) {
  return def('CharSet').check(value) && value.members.length === 1;
}, 'CharSet with single member');

var Character = new Type(function(value) {
  return isString.check(value) && value.length === 1;
}, 'Character');

module.exports = {
  SingleMemberCharSet: SingleMemberCharSet,
  Character: Character
};
