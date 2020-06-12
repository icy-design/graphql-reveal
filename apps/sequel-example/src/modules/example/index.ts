import 'graphql-import-node';
import { merge } from 'lodash';
import { GraphQLModule } from '@graphql-modules/core';
import { SequelDirectiveModule, buildSequelResolvers } from '@graphql-reveal/sequel';
import { Sequelize } from 'sequelize';
import * as typeDefs from './type.graphql';
import { Seeds }from './seed';

const sequelize = new Sequelize('sqlite::memory:')

const externResolvers = {
  SequelCompany: {
    info: (_, __, ___) => {
      return { id: _.info };
    },
  }
};

function buildCompositionResolver(caseStyle = 'camel') {
  const resolvers = buildSequelResolvers({ typeDefs, sequelize, caseStyle });
  sequelize.sync().then(() => {
    const queryInterface = sequelize.getQueryInterface();
    for (const key of Object.keys(Seeds)) {
      queryInterface.bulkInsert(key, Seeds[key]);
    }
  });
  return merge(resolvers, externResolvers);
}

export const SequelExampleModule = new GraphQLModule({
  name: 'SequelExample',
  imports: [
    SequelDirectiveModule.forRoot({ sequelize })
  ],
  typeDefs,
  resolvers: buildCompositionResolver()
});