import 'graphql-import-node';
import { GraphQLModule } from '@graphql-modules/core';
import { FakeDirectiveModule } from '@graphql-reveal/faker';
import * as typeDefs from './type.graphql';

const resolvers = {
  Query: {
    fakeCompanies(_, __) {
      return [];
    },
    fakeCompany(_, { id }) {
      return { id };
    },
    fakeEmployee(_, { id }) {
      return { id };
    }
  },
  Mutation: {
    async addFakeEmployee(_, args) {
      return args;
    },
  },
};

export const FakeExampleModule = new GraphQLModule({
  name: 'FakeExample',
  imports: [FakeDirectiveModule],
  typeDefs,
  resolvers
});