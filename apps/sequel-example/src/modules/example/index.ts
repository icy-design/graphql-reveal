import 'graphql-import-node';
import { GraphQLModule } from '@graphql-modules/core';
import * as typeDefs from './type.graphql';

const resolvers = {
  Query: {
    sequelCompanies(_, __) {
      return [];
    },
    sequelCompany(_, { id }) {
      return { id };
    },
    sequelEmployee(_, { id }) {
      return { id };
    }
  },
  Mutation: {
    async addSequelEmployee(_, args) {
      return args;
    },
  },
};

export const SequelExampleModule = new GraphQLModule({
  name: 'SequelExample',
  imports: [],
  typeDefs,
  resolvers
});