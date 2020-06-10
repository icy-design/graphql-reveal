
import { DocumentNode } from 'graphql';
import { resolver } from 'graphql-sequelize';
import { plural } from 'pluralize';
import Case from 'case';
import { Sequelize, Model, Op } from 'sequelize';
import { getTypesWithDirective } from './directives';
import { createDefinitions, createAssociations } from './definitions';
import { getPrimaryKey } from '../utils';
import { uniqueId, MaxUniqueId32 } from '../utils/unique_id';

const debug = require('debug')('graphql-reveal:sequel');

export interface IBuildSequelOption {
  typeDefs: DocumentNode;
  sequelize: Sequelize;
  caseStyle: string;
}

export const wrapResolver = (modelResolver) => async (root, args, context, info) => {
  const result = await modelResolver(root, args, context, info);
  debug('resolved', info.operation.name, result);
  return result;
};

export const buildSequelResolvers = ({ typeDefs, sequelize, caseStyle }: IBuildSequelOption) => {
  let models: Map<String, Model> = new Map();
  const fieldStyle = Case[caseStyle];

  const typeUsagesWithModel = getTypesWithDirective(typeDefs, 'model');
  for (const typeName in typeUsagesWithModel) {
    const type = typeUsagesWithModel[typeName];
    for (const directive of type.directives) {
      if (directive.name === 'model') {
        const tableName = directive.args.name || typeName.toLowerCase();
        const definitions = createDefinitions(type.fields, fieldStyle);
        // debug('model', typeName, tableName, JSON.stringify(type.fields, null, 2));
        models[typeName] = sequelize.define(typeName, definitions, {
          tableName,
          timestamps: false
        });
      }
    }
  }
  const associations = createAssociations(typeUsagesWithModel, fieldStyle);
  for (const assoc of associations) {
    let { source, target, type, options } = assoc;
    options.as = assoc.name // field name as the alias of relationship
    debug('relationship', source, type, target, options);
    models[source][assoc.name] = models[source][type](models[target], options);
  }

  const queries = {};
  const mutations = {};
  const types = {};

  for (const key in models) {
    const model = models[key];
    const typeName = model.name;
    
    // queries resolvers
    const queryName = fieldStyle(model.name);
    queries[queryName] = wrapResolver(resolver(model))
    queries[`${plural(queryName)}`] = wrapResolver(resolver(model));
    queries[`find${plural(typeName)}`] = async (_, { where }, __) => {
      const priKey = getPrimaryKey(model);
      if (where.ids) {
        where[priKey] = where.ids;
        delete where.ids;
      }
      debug(`find${plural(queryName)}`, where);
      const thing = await model.findAll({
        where: where,
        order: [[priKey, 'DESC']]
      });
      return thing;
    };
    queries[`fetch${plural(typeName)}`] = async (_, { next, limit }, __) => {
      debug(`fetch${plural(queryName)}`, next, limit);
      const priKey = getPrimaryKey(model);
      const thing = await model.findAll({
        where: {
          id: { [Op.lt]: next || MaxUniqueId32 }
        },
        order: [[priKey, 'DESC']],
        limit: limit || 100
      });
      return thing;
    };

    // mutation resolvers
    mutations[`create${typeName}`] = async (_, { request }, __) => {
      const priKey = getPrimaryKey(model);
      if (!request[priKey]) {
        request[priKey] = uniqueId();
      }
      debug(`create${typeName}`, request);
      const thing = await model.create(request);
      return thing;
    };
    mutations[`update${typeName}`] = async (_, { request }, __) => {
      const priKey = getPrimaryKey(model);
      const thing = await model.findOne({
        where: { [priKey]: request[priKey] },
      });
      debug(`update${typeName}`, request);
      await thing.update(request);
      return thing;
    };
    mutations[`delete${typeName}`] = async (_, { request }, __) => {
      const thing = await model.findOne({
        where: request,
      });
      await thing.destroy();
      return {
        success: true,
      };
    };

    // types resolvers
    types[typeName] = {};

    // hasOne association
    const hasOne = associations
      .filter(({ type }) => type === 'hasOne')
      .filter(({ source }) => source === key);
    for (const assoc of hasOne) {
      const assocModel = model[assoc.name]
      types[typeName][assoc.name] = wrapResolver(resolver(assocModel))
    }

    // hasMany association
    const hasMany = associations
      .filter(({ type }) => type === 'hasMany')
      .filter(({ source }) => source === key);
    for (const assoc of hasMany) {
      const assocModel = model[assoc.name]
      types[typeName][assoc.name] = wrapResolver(resolver(assocModel))
    }

    // belongsTo association
    const belongsTo = associations
      .filter(({ type }) => type === 'belongsTo')
      .filter(({ source }) => source === key);
    for (const assoc of belongsTo) {
      const assocModel = model[assoc.name]
      types[typeName][assoc.name] = wrapResolver(resolver(assocModel))
    }

    // belongsToMany association
    const belongsToMany = associations
      .filter(({ type }) => type === 'belongsToMany')
      .map(({ source, target }) => [source, target])
      .filter(sides => sides.includes(key));
    for (const sides of belongsToMany) {
      const [other] = sides.filter(side => side !== model.name);
      const assocModel = model[other]
      types[typeName][fieldStyle(other)] = wrapResolver(resolver(assocModel))
    }
  }

  // debug('queries', queries);
  // debug('mutations', mutations);
  // debug('types', types);

  return { 
    Query: queries,
    Mutation: mutations,
    ...types
  };
}
