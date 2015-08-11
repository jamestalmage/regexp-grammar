var types = require('ast-types/lib/types');
var shared = require('ast-types/lib/shared');
var isPrimitive = shared.isPrimitive;
var b = types.builders;

function copy(type, builder) {
  builder = builder || b;

  if (isPrimitive.check(type)) {
    return type;
  }

  if (type instanceof Array) {
    return type.map(function(child) {
      return copy(child, builder);
    })
  }

  if ('string' !== typeof type.type) {
    throw new Error('not an AST node: ' + JSON.stringify(type));
  }

  var builderName = types.getBuilderName(type.type);
  var buildFn = b[builderName];

  if (!buildFn) {
    throw new Error(type.type + ' does not have a registered builder');
  }

  var buildFn2 = builder[builderName];

  if ('function' !== typeof buildFn2) {
    throw new Error('custom builder does not have function: ' + builderName);
  }

  var args = [];
  for (var i = 0; i < buildFn.paramCount; i++) {
    var p = copy(type[buildFn[i].name], builder);
    if (typeof p !== 'undefined') {
      args[i] = p;
    }
  }

  return buildFn2.apply(builder, args);
}

module.exports = copy;
