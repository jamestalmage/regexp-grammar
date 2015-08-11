var types = require('./type-definitions');

types.finalize();

exports.Type = types.Type;
exports.builtInTypes = types.builtInTypes;
exports.namedTypes = types.namedTypes;
exports.builders = types.builders;
exports.defineMethod = types.defineMethod;
exports.getFieldNames = types.getFieldNames;
exports.getFieldValue = types.getFieldValue;
exports.eachField = types.eachField;
exports.someField = types.someField;
exports.getSupertypeNames = types.getSupertypeNames;
exports.astNodesAreEquivalent = require('ast-types/lib/equiv');
exports.finalize = types.finalize;
exports.NodePath = require('ast-types/lib/node-path');
exports.PathVisitor = require('ast-types/lib/path-visitor');
exports.visit = exports.PathVisitor.visit;
