
import { DocumentNode } from 'graphql';
import { resolver } from 'graphql-sequelize';
import { singular } from 'pluralize';
import Case from 'case';
import { Sequelize, Model } from 'sequelize';
import { getTypesWithDirective } from './directives';
import { createDefinitions, createAssociations } from './definitions';

export interface IBuildSequelOption {
  typeDefs: DocumentNode;
  sequelize: Sequelize;
  caseStyle: string;
}

export const wrapCompositionResolver = (modelResolver) => (next) => async (root, args, context, info) => {
  const prevResult = await next(root, args, context, info);
  console.log('info operation:', info.operation.name);
  const result = await modelResolver(root, args, context, info);
  return result || prevResult;
};

export const buildSequelResolvers = ({ typeDefs, sequelize, caseStyle }: IBuildSequelOption) => {
  let models: Map<String, Model> = new Map();
  const formatFieldName = Case[caseStyle];

  const typeUsagesWithModel = getTypesWithDirective(typeDefs, 'model');
  for (const typeName in typeUsagesWithModel) {
    const type = typeUsagesWithModel[typeName];
    for (const directive of type.directives) {
      if (directive.name === 'model') {
        const tableName = directive.args.name || typeName.toLowerCase();
        const definitions = createDefinitions(type.fields, formatFieldName);
        console.log('model', typeName, tableName, JSON.stringify(type.fields, null, 2));
        models[typeName] = sequelize.define(typeName, definitions, {
          tableName,
          timestamps: false
        });
      }
    }
  }
  const associations = createAssociations(typeUsagesWithModel, formatFieldName);
  associations.forEach(({ source, target, type, options }) => {
    const key = type === 'belongsTo' ? singular(target) : target;
    models[source][key] = models[source][type](models[target], options);
  });

  // const mutations = {};
  let queries = {};

  for (const key in models) {
    const model = models[key];
    const modelResolver = wrapCompositionResolver(resolver(model));
    queries[`Query.${formatFieldName(model.name)}`] = [modelResolver]
    queries[`Query.${singular(formatFieldName(model.name))}`] = [modelResolver];
  }
  queries[`SequelEmployee.company`] = wrapCompositionResolver(resolver(models['SequelCompany']));
  queries[`SequelCompany.employees`] = wrapCompositionResolver(resolver(models['SequelEmployee']));
  console.log('queries', queries);

  return { ...queries };
}
