import 'graphql-import-node';
import { GraphQLModule } from '@graphql-modules/core';
import { FakeDirectiveModule } from '@graphql-reveal/faker';
import * as typeDefs from './sample.graphql';

const resolvers = {
  Query: {
    companies(_, __) {
      return [];
    },
    company(_, { id }) {
      return { id };
    },
    employee(_, { id }) {
      return { id };
    }
  },
  Mutation: {
    async addEmployee(_, args) {
      return args;
    },
  },
};

export const SampleModule = new GraphQLModule({
  name: 'samples',
  imports: [FakeDirectiveModule],
  typeDefs,
  resolvers,
});