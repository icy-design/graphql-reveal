import { DataTypes } from 'sequelize';
import { formatFieldName } from '../utils/build_utils';
import { FieldUsage } from './directives';

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
      return DataTypes.BLOB;
  }
};

export function createDefinitions(fields: FieldUsage[]) {
  return fields.reduce((acc, field) => {
    const directives = field.directives || [];
    const primaryKey = directives.some(o => o.name === 'primary');
    acc[formatFieldName(field.name)] = {
      type: parseFieldType(field.type),
      primaryKey: primaryKey,
      field: field.name,
      allowNull: !field.nonNull,
      // defaultValue: directives.find(o => o.name === 'default'),
      autoIncrement: field.type === 'INTEGER' && primaryKey,
    };
    return acc;
  }, {});
};
