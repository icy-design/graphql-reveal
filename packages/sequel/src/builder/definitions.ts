import { DataTypes } from 'sequelize';
import { getForeignKey } from '../utils';
import { FieldUsage, TypeToUsages } from './directives';

export interface ModelAssociation {
  name: string;
  source: string;
  target: string;
  type: string;
  options?: any;
}

const parseFieldType = (field) => {
  const c = field.type.toLowerCase();
  switch (c) {
    case 'id':
      return DataTypes.STRING;
    case "int":
      return DataTypes.INTEGER;
    case 'float':
      return DataTypes.DECIMAL;
    case 'string':
      return DataTypes.STRING;
    case 'boolean':
      return DataTypes.BOOLEAN;
    case 'object':
      return DataTypes.JSON;
    default:
      const defType = field.directives?.find(o => o.name === 'field')?.args['type'];
      switch (field.definition) {
        case 'EnumTypeDefinition':
          return defType || DataTypes.STRING;
        default:
          return defType? parseFieldType({ type: defType }) : null;
      }
      return null;
  }
};

export function createAssociations(typeUsages: TypeToUsages, fieldStyle = (s: string) => s): ModelAssociation[] {
  let associations:ModelAssociation[] = [];
  for (const typeName in typeUsages) {
    const type = typeUsages[typeName];
    for (const field of type.fields) {
      const directives = field.directives || [];
      for (const directive of directives) {
        switch (directive.name) {
          case 'belongsTo':
            if (!directive.args.foreignKey) {
              directive.args.foreignKey = fieldStyle(getForeignKey(field.name));
            }
            directive.args.constraints = false; // avoid cyclic relationship
            associations.push({
              name: field.name,
              source: typeName,
              target: field.type,
              type: directive.name,
              options: directive.args,
            });
            break;
          case 'hasOne':
          case 'hasMany':
            if (!directive.args.foreignKey) {
              const from = type.directives.find(o => o.name === 'model')?.args['name'] || typeName;
              directive.args.foreignKey = fieldStyle(getForeignKey(from));
            }
            directive.args.constraints = false; // avoid cyclic relationship
            associations.push({
              name: field.name,
              source: typeName,
              target: field.type,
              type: directive.name,
              options: directive.args,
            });
            break;
        }
      }
    }
  }
  return associations;
}

export function createDefinitions(fields: FieldUsage[], fieldStyle = (s: string) => s) {
  return fields.reduce((acc, field) => {
    const directives = field.directives || [];
    const primaryKey = directives.some(o => o.name === 'primary');
    const fieldType = parseFieldType(field);
    if (fieldType) {
      acc[fieldStyle(field.name)] = {
        type: fieldType,
        primaryKey: primaryKey,
        field: field.name,
        allowNull: !field.nonNull,
        // defaultValue: directives.find(o => o.name === 'default'),
        autoIncrement: fieldType === DataTypes.INTEGER && primaryKey,
      };
    }
    return acc;
  }, {});
};
