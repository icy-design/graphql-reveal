import { DataTypes } from 'sequelize';
import { getForeignKey } from '../utils';
import { FieldUsage, TypeToUsages } from './directives';

export interface ModelAssociation {
  source: string;
  target: string;
  type: string;
  options?: any;
}

const parseFieldType = type => {
  const c = type.toLowerCase();
  switch (c) {
    case 'id':
      return DataTypes.STRING;
    case "int":
      return DataTypes.INTEGER;
    case 'float':
      return DataTypes.DECIMAL;
    case 'string':
      return DataTypes.TEXT;
    case 'boolean':
      return DataTypes.BOOLEAN;
    case 'object':
      return DataTypes.JSON;
    default:
      return null;
  }
};

export function createAssociations(typeUsages: TypeToUsages, formatFieldName): ModelAssociation[] {
  let associations:ModelAssociation[] = [];
  for (const typeName in typeUsages) {
    const type = typeUsages[typeName];
    for (const field of type.fields) {
      const directives = field.directives || [];
      for (const directive of directives) {
        switch (directive.name) {
          case 'belongsTo':
            associations.push({
              source: typeName,
              target: field.type,
              type: 'belongsTo',
              options: {
                foreignKey: formatFieldName(getForeignKey(field.name)),
              },
            });
            break;
          case 'hasOne':
          case 'hasMany':
            const from = type.directives.find(o => o.name === 'model')?.args['name'] || typeName;
            associations.push({
              source: typeName,
              target: field.type,
              type: 'hasMany',
              options: {
                foreignKey: formatFieldName(getForeignKey(from)),
              },
            });
            break;
        }
      }
    }
  }
  return associations;
}

export function createDefinitions(fields: FieldUsage[], formatFieldName) {
  return fields.reduce((acc, field) => {
    const directives = field.directives || [];
    const primaryKey = directives.some(o => o.name === 'primary');
    const fieldType = parseFieldType(field.type);
    if (fieldType) {
      acc[formatFieldName(field.name)] = {
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
