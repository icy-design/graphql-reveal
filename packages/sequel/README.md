# @graphql-reveal/sequel

Map your graphql schema to a database like MySQL/PostgreSQL/Sqlite with sequelize. It tries to infer relationships between types, currently supporting `belongsTo`, `hasMany` and `belongsToMany`. It also forms the basic mutations necessary to create, update, and delete objects, as well as assoicate many-to-many relationships.

We use `@model` directive to let you specify how to map your schema to database models.

```code
type Query {
  findSequelEmployees(where: SequeEmployeeFilter): [SequelEmployee]
  fetchSequelEmployees(next: ID, limit: Int): [SequelEmployee]
  sequelEmployee(id: ID): SequelEmployee
  sequelEmployees: [SequelEmployee]

  findSequelCompanies(where: SequeCompanyFilter): [SequelCompany]
  fetchSequelCompanies(next: ID, limit: Int): [SequelCompany]
  sequelCompany(id: ID): SequelCompany
  sequelCompanies: [SequelCompany]
}

type Mutation {
  createSequelEmployee(request: SequelEmployeeRequest): SequelEmployee
  updateSequelEmployee(request: SequelEmployeeRequest): SequelEmployee
  deleteSequelEmployee(request: SequelEmployeeRequest): SequelEmployee
  createSequelCompany(request: SequelCompanyRequest): SequelCompany
  updateSequelCompany(request: SequelCompanyRequest): SequelCompany
  deleteSequelCompany(request: SequelCompanyRequest): SequelCompany
}

type SequelCompany @model(name: "company") {
  id: ID! @primary
  name: String
  industry: String
  employees: [SequelEmployee] @hasMany
}

type SequelEmployee @model(name: "employee") {
  id: ID! @primary
  firstName: String
  lastName: String
  address: String @default(value: "")
  # subordinates: [SequelEmployee] @hasMany
  company: SequelCompany @belongsTo
}

input SequelCompanyRequest {
  id: ID
  name: String!
  industry: String
}

input SequelEmployeeRequest {
  id: ID
  firstName: String!
  lastName: String!
  address: String
  companyId: ID
}

input SequeCompanyFilter {
  id: ID
  ids: [ID]
  name: String
}

input SequeEmployeeFilter {
  id: ID
  ids: [ID]
  firstName: String
  lastName: String
}
```

To use it in GraphQL Modules, import SequelDirectiveModule and buildSequelResolvers from @graphql-reveal/sequel and mock the modules for rapid prototyping.

```code
import 'graphql-import-node';
import { GraphQLModule } from '@graphql-modules/core';
import { SequelDirectiveModule, buildSequelResolvers } from '@graphql-reveal/sequel';
import { Sequelize } from 'sequelize';
import * as typeDefs from './type.graphql';
import { seedData } from './seed';

const sequelize = new Sequelize('sqlite::memory:')

function buildCompositionResolver(caseStyle = 'camel') {
  const resolvers = buildSequelResolvers({ typeDefs, sequelize, caseStyle });
  sequelize.sync().then(() => {
    const queryInterface = sequelize.getQueryInterface();
    for (const key of Object.keys(seedData)) {
      queryInterface.bulkInsert(key, seedData[key]);
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
```