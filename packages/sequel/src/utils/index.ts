import { singular } from 'pluralize';

export const getPrimaryKey = model => {
  return Object.keys(model.rawAttributes).find(key => {
    const attr = model.rawAttributes[key];
    return attr.primaryKey;
  });
};

export const getForeignKey = (key: string, pattern = 'Id') => {
  key = key.toLowerCase();
  if (key.endsWith(pattern)) {
    return key;
  }
  const singularKey = singular(key);
  return `${singularKey}${pattern}`;
};
