import { DocumentNode, ObjectTypeDefinitionNode, TypeNode, ValueNode, Kind } from 'graphql';

export type DirectiveArgs = { [name: string]: any };
export type DirectiveUsage = { name: string; args: DirectiveArgs };
export type FieldUsage = {
  name: string;
  type: string;
  isList: boolean;
  nonNull: boolean;
  directives?: DirectiveUsage[]
}
export type TypeUsage = {
  name: string;
  kind: string;
  fields?: FieldUsage[]
  directives?: DirectiveUsage[]
}
export type TypeToUsages = {
  [type: string]: TypeUsage;
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

function parseFieldTypeValue(type: TypeNode, isList = false, nonNull = false): any {
  switch(type.kind) {
    case Kind.NAMED_TYPE:
      return { type: type.name.value, isList, nonNull };
    case Kind.LIST_TYPE:
      return parseFieldTypeValue(type.type, true, nonNull);
    case Kind.NON_NULL_TYPE:
      return parseFieldTypeValue(type.type, isList, true);
  }
}

export function getTypesWithDirectives(documentNode: DocumentNode): TypeToUsages {
  const result: TypeToUsages = {};
  const allTypes = documentNode.definitions.filter(isTypeWithDirectives);

  for (const type of allTypes) {
    const typeName = type.name.value;

    const fields = {}
    for (const field of type.fields) {
      const fieldName = field.name.value;
      const fieldType = parseFieldTypeValue(field.type);

      fields[fieldName] = {
        name: fieldName,
        ...fieldType
      }

      if (field.directives && field.directives.length > 0) {
        const directives: DirectiveUsage[] = field.directives.map(d => ({
          name: d.name.value,
          args: (d.arguments || []).reduce(
            (prev, arg) => ({ ...prev, [arg.name.value]: parseDirectiveValue(arg.value) }),
            {}
          )
        }));

        fields[fieldName]['directives'] = directives
      }
    }

    if (type.directives && type.directives.length > 0) {
      const directives: DirectiveUsage[] = type.directives.map(d => ({
        name: d.name.value,
        args: (d.arguments || []).reduce(
          (prev, arg) => ({ ...prev, [arg.name.value]: parseDirectiveValue(arg.value) }),
          {}
        ),
        fields: fields,
      }));
      result[typeName] = {
        name: typeName,
        kind: type.kind,
        fields: Object.values(fields),
        directives
      };
    }
  }

  return result;
}