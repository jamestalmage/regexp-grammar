module.exports = optimize;
var types = require('../lib/types');
var n = types.namedTypes;
var b = types.builders;
var CharSet = n.CharSet;
var CharacterRange = n.CharacterRange;
var CharSetUnion = n.CharSetUnion;

function optimize(ast, codePointAt) {
  var codePoint = require('./code-point')(codePointAt);

  return types.visit(ast, {

    visitCharacterRange: function(path) {
      var node = path.value;
      if (CharSet.check(node.min)) {
        node.min = node.min.members[0];
      }
      if (CharSet.check(node.max)) {
        node.max = node.max.members[0];
      }
      return false;
    },

    visitCharSet: function(path) {
      var node = path.value;
      var members = node.members;
      if (members.length === 0) {
        return false;
      }
      members.sort();
      var lastMember = members[0];
      var lastMemberCp = codePoint(lastMember);
      var newMembers = [];
      var foundRun = false;
      var lastWasRange = false;

      for (var i = 1, len = members.length; i < len; ++i) {
        var nextMember = members[i];
        var nextMemberCp = codePoint(nextMember);
        if (nextMemberCp - 1 === lastMemberCp) {
          foundRun = true;
          if (lastWasRange) {
            lastMember.max = nextMember;
          } else {
            lastMember = b.characterRange(lastMember, nextMember);
            lastWasRange = true;
          }
        } else {
          newMembers.push(lastMember);
          lastMember = nextMember;
          lastWasRange = false;
        }
        lastMemberCp = nextMemberCp;
      }

      if (foundRun) {
        newMembers.push(lastMember);
        path.replace(b.charSetUnion(newMembers, node.invert));
      }

      return false;
    },

    visitCharSetUnion: function(path) {
      this.traverse(path);


    }
  });
}



