import 'graphql-import-node';
import { GraphQLModule } from '@graphql-modules/core';
import { SequelDirectiveModule, buildSequelResolvers } from '@graphql-reveal/sequel';
import { Sequelize } from 'sequelize';
import * as typeDefs from './type.graphql';
import { Seeds }from './seed';

const sequelize = new Sequelize('sqlite::memory:')

function buildCompositionResolver(caseStyle = 'camel') {
  const resolvers = buildSequelResolvers({ typeDefs, sequelize, caseStyle });
  sequelize.sync().then(() => {
    const queryInterface = sequelize.getQueryInterface();
    for (const key of Object.keys(Seeds)) {
      queryInterface.bulkInsert(key, Seeds[key]);
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
  resolvers: buildCompositionResolver()
});