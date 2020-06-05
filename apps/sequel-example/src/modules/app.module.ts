import { GraphQLModule } from '@graphql-modules/core';
import { SchemaDirectiveVisitor, makeExecutableSchema } from 'graphql-tools';
import { SequelExampleModule } from './example';

const appModule:any = new GraphQLModule({
  name: 'app',
  imports: [
    SequelExampleModule
  ],
});

// workaround to invoke visitSchemaDirectives
const appSchema:any = makeExecutableSchema({
  typeDefs: appModule.typeDefs,
  resolvers: appModule.resolvers,
  inheritResolversFromInterfaces: true
});

SchemaDirectiveVisitor.visitSchemaDirectives(appSchema, appModule.schemaDirectives)

export { appModule, appSchema }