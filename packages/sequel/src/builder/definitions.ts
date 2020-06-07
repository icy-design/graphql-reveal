import { DataTypes } from 'sequelize';
import { formatFieldName } from '../utils/build_utils';

const transformColumnToType = column => {
  const c = column.toLowerCase();

  if (c.includes('int')) {
    return DataTypes.INTEGER;
  }

  if (c.includes('char') || c === 'clob' || c === 'text') {
    return DataTypes.TEXT;
  }

  if (c.includes('double') || c === 'real' || c === 'float') {
    return DataTypes.REAL;
  }

  if (
    c.includes('decimal') ||
    c.includes('numeric') ||
    c === 'boolean' ||
    c === 'date' ||
    c === 'datetime'
  ) {
    return DataTypes.DECIMAL;
  }

  return DataTypes.BLOB;
};

export default columns => {
  return columns.reduce((acc, column) => {
    acc[formatFieldName(column.name)] = {
      type: transformColumnToType(column.type),
      primaryKey: column.pk === 1,
      field: column.name,
      allowNull: column.notnull === 0 || column.dflt_value !== null,
      defaultValue: column.dflt_value,
      autoIncrement: column.type === 'INTEGER' && column.pk === 1,
    };

    return acc;
  }, {});
};
