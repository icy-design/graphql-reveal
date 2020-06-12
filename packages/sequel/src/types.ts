import gql from 'graphql-tag';

export const sequelTypes = gql`
directive @model(
  name: String # the name of model
  primary: String = "id" # primary key field
) on OBJECT

directive @field(
  name: String # the name of model field
  type: String # the type of model field
) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION

directive @primary on FIELD_DEFINITION
directive @default(value: String) on FIELD_DEFINITION
directive @hasOne(sourceKey: String, foreignKey: String) on FIELD_DEFINITION
directive @hasMany(sourceKey: String, foreignKey: String) on FIELD_DEFINITION
directive @belongsTo(foreignKey: String) on FIELD_DEFINITION
directive @belongsToMany(through: String) on FIELD_DEFINITION
`;
