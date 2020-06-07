
import { DocumentNode } from 'graphql';
import { Sequelize, Model, DataTypes } from 'sequelize';
import { getTypesWithDirectives } from '../utils/directives_utils';

export interface IBuildSequelOption {
  typeDefs: DocumentNode;
  sequelize: Sequelize
}

export const buildSequelResolvers = ({ typeDefs, sequelize }: IBuildSequelOption) => {
  let models: Map<String, Model> = new Map();

  const typeToDirectivesMap = getTypesWithDirectives(typeDefs);
  let result = {};

  for (const name in typeToDirectivesMap) {
    const directive = typeToDirectivesMap[name];
    console.log('directive', directive);
    models[name] = sequelize.define(name, {
      name: DataTypes.STRING
    })
  }

  return result;
}
