import gql from 'graphql-tag';

export const sequelDefinition = gql`
directive @model(
  name: String # the name of model
  primary: String = "id" # primary key field
) on OBJECT

directive @field(
  name: String # the name of model field
) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION
`;
