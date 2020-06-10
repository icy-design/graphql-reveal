import { GraphQLObjectType, defaultFieldResolver } from 'graphql';
import { GraphQLModule } from '@graphql-modules/core';
import { SchemaDirectiveVisitor } from 'graphql-tools';
import { Sequelize } from 'sequelize';
import { sequelTypes } from './types';

export * from './builder/schema';
export * from './utils/unique_id';

class SequelDirective extends SchemaDirectiveVisitor {

  visitObject(type: GraphQLObjectType) {
    this.ensureFieldsWrapped(type);
  }

  public visitFieldDefinition(_, details) {
    this.ensureFieldsWrapped(details.objectType);
  }

  ensureFieldsWrapped(objectType: GraphQLObjectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping
    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      //console.log('field', field);
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function (...args) {
        return resolve.apply(this, args);
      };
    });
  }
}

export interface ISequelModuleConfig {
  sequelize: Sequelize;
}

export const SequelDirectiveModule:GraphQLModule = new GraphQLModule<ISequelModuleConfig>({
  typeDefs: sequelTypes,
  schemaDirectives: {
    model: SequelDirective
  }
});