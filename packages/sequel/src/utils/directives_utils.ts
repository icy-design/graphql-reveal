import { DocumentNode, ObjectTypeDefinitionNode, ValueNode, Kind } from 'graphql';

export type DirectiveArgs = { [name: string]: any };
export type DirectiveUsage = { name: string; args: DirectiveArgs };
export type TypeToDirectives = {
  [type: string]: DirectiveUsage[];
};

function isTypeWithDirectives(obj: any): obj is ObjectTypeDefinitionNode | ObjectTypeDefinitionNode {
  return obj
    && (obj.kind === 'ObjectTypeDefinition' || obj.kind === 'ObjectTypeExtension')
    && obj.directives.length > 0;
}

function parseDirectiveValue(value: ValueNode): any {
  switch (value.kind) {
    case Kind.INT:
      return parseInt(value.value);
    case Kind.FLOAT:
      return parseFloat(value.value);
    case Kind.BOOLEAN:
      return Boolean(value.value);
    case Kind.STRING:
    case Kind.ENUM:
      return value.value;
    case Kind.LIST:
      return value.values.map(v => parseDirectiveValue(v));
    case Kind.OBJECT:
      return value.fields.reduce((prev, v) => ({ ...prev, [v.name.value]: parseDirectiveValue(v.value) }), {});
    case Kind.NULL:
      return null;
    default:
      return null;
  }
}

export function getTypesWithDirectives(documentNode: DocumentNode): TypeToDirectives {
  const result: TypeToDirectives = {};
  const allTypes = documentNode.definitions.filter(isTypeWithDirectives);

  for (const type of allTypes) {
    const typeName = type.name.value;
    if (type.directives && type.directives.length > 0) {
      const directives: DirectiveUsage[] = type.directives.map(d => ({
        name: d.name.value,
        args: (d.arguments || []).reduce(
          (prev, arg) => ({ ...prev, [arg.name.value]: parseDirectiveValue(arg.value) }),
          {}
        ),
      }));
      result[typeName] = directives;
    }
  }

  return result;
}