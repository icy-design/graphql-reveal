
import { DocumentNode } from 'graphql';
import { resolver } from 'graphql-sequelize';
import { singular } from 'pluralize';
import { Sequelize, Model } from 'sequelize';
import { getTypesWithDirectives } from './directives';
import { createDefinitions } from './definitions';
import { formatFieldName } from '../utils/build_utils';

export interface IBuildSequelOption {
  typeDefs: DocumentNode;
  sequelize: Sequelize
}

export const wrapCompositionResolver = (modelResolver) => (next) => async (root, args, context, info) => {
  const prevResult = await next(root, args, context, info);
  const result = await modelResolver(root, args, context, info);
  console.log('info operation:', info.operation);
  return result || prevResult;
};

export const buildSequelResolvers = ({ typeDefs, sequelize }: IBuildSequelOption) => {
  let models: Map<String, Model> = new Map();

  const typeToDirectivesMap = getTypesWithDirectives(typeDefs);
  for (const typeName in typeToDirectivesMap) {
    const type = typeToDirectivesMap[typeName];
    for (const directive of type.directives) {
      if (directive.name === 'model') {
        const tableName = directive.args.name || typeName.toLowerCase();
        const definitions = createDefinitions(type.fields);
        console.log('model', typeName, tableName, JSON.stringify(type.fields, null, 2));
        models[typeName] = sequelize.define(typeName, definitions, {
          tableName,
          timestamps: false
        });
      }
    }
  }

  // const mutations = {};
  let queries = {};

  for (const key in models) {
    const model = models[key];
    const modelResolver = wrapCompositionResolver(resolver(model));
    queries[`Query.${formatFieldName(model.name)}`] = [modelResolver]
    queries[`Query.${singular(formatFieldName(model.name))}`] = [modelResolver];
  }
  console.log('queries', queries);

  return { ...queries };
}
