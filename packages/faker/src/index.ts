import { GraphQLField, GraphQLScalarType } from 'graphql';
import { GraphQLModule } from '@graphql-modules/core';
import { SchemaDirectiveVisitor } from 'graphql-tools';
import { fakeFieldResolver } from './fake_schema';
import { fakeDefinition } from './fake_definition';

class FakeDirective extends SchemaDirectiveVisitor {
  public visitScalar(scalar: GraphQLScalarType) {
    console.log('#visitScalar', scalar);
  }
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    field.resolve = async function (source, args, context, info) {
      const result = await fakeFieldResolver.call(this, source, args, context, info);
      return result;
    };
  }
}

export const FakeDirectiveModule = new GraphQLModule({
  typeDefs: fakeDefinition,
  schemaDirectives: {
    fake: FakeDirective,
    listLength: FakeDirective,
    examples: FakeDirective,
  }
});