import 'graphql-import-node';
import { GraphQLModule } from '@graphql-modules/core';
import { SequelDirectiveModule, buildSequelResolvers } from '@graphql-reveal/sequel';
import { Sequelize } from 'sequelize';
import * as typeDefs from './type.graphql';

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

export const crud = (db) => (next) => async (root, args, context, info) => {
  const prevResult = await next(root, args, context, info);
  console.log('sequelize models', 
  db.models);
  console.log('info operation:', info.operation);
  if (info.operation.name.value === 'get')
  return '!!!' + prevResult;
};



export const SequelExampleModule = new GraphQLModule({
  name: 'SequelExample',
  imports: [
    SequelDirectiveModule.forRoot({ sequelize })
  ],
  typeDefs,
  resolvers,
  resolversComposition: buildSequelResolvers({ typeDefs, sequelize })
  // resolversComposition: {
  //   'Query.*': [ crud(sequelize) ],
  // },
});