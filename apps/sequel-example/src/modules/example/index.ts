import 'graphql-import-node';
import { GraphQLModule } from '@graphql-modules/core';
import { SequelDirectiveModule, buildSequelResolvers } from '@graphql-reveal/sequel';
import { Sequelize } from 'sequelize';
import * as typeDefs from './type.graphql';
import { seedData } from './seed';

const sequelize = new Sequelize('sqlite::memory:')

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

function buildCompositionResolver() {
  const resolvers = buildSequelResolvers({ typeDefs, sequelize });
  sequelize.sync().then(() => {
    const queryInterface = sequelize.getQueryInterface();
    for (const key of Object.keys(seedData)) {
      queryInterface.bulkInsert(key, seedData[key]);
    }
  });
  return resolvers;
}

export const SequelExampleModule = new GraphQLModule({
  name: 'SequelExample',
  imports: [
    SequelDirectiveModule.forRoot({ sequelize })
  ],
  typeDefs,
  resolvers,
  resolversComposition: buildCompositionResolver()
});