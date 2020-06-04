**GraphQL Reveal** is a toolset dedicated to prototype API/Schema with GraphQL Modules .

# @graphql-reveal/faker

Mock your future API or extend the existing API with realistic data from [faker.js](https://github.com/Marak/faker.js).

We use `@fake` directive to let you specify how to fake data. And if 60+ fakers is not enough for you, just use `@examples` directive to provide examples. Use `@listLength` directive to specify number of returned array items. Add a directive to any field or custom scalar definition:

```code
type Query {
  employee(id: ID): Employee
  company(id: ID): Company
  companies: [Company!]
}

type Mutation {
  addEmployee(firstName: String!, lastName: String!): Employee!
}

type Company {
  id: ID @fake(type: mobileNumber)
  name: String @fake(type:companyName)
  industry: String @examples(values: ["IT", "Manufacturing", "Medicine", "Media"])
  employees: [Employee!] @listLength(min: 5, max: 10)
}

type Employee {
  id: ID @fake(type: mobileNumber)
  firstName: String @fake(type: firstName, locale:en_CA)
  lastName: String @fake(type: lastName, locale:en_CA)
  address: String @fake(type:streetAddress, options: { useFullAddress: true })
  subordinates: [Employee!] @listLength(min: 0, max: 3)
  company: Company
}
```

To use it in GraphQL Modules, import FakeDirectiveModule from graphql-reveal and mock the modules for rapid prototyping.

```code
import 'graphql-import-node';
import { GraphQLModule } from '@graphql-modules/core';
import { FakeDirectiveModule } from '@graphql-reveal/faker';
import * as typeDefs from './sample.graphql';

const resolvers = {
  Query: {
    companies(_, __) {
      return [];
    },
    company(_, { id }) {
      return { id };
    },
    employee(_, { id }) {
      return { id };
    }
  },
  Mutation: {
    async addEmployee(_, args) {
      return args;
    },
  },
};

export const SampleModule = new GraphQLModule({
  name: 'samples',
  imports: [FakeDirectiveModule],
  typeDefs,
  resolvers,
});
```