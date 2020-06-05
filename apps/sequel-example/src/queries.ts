const sampleQueries = `mutation createSequelEmployee($firtName: String!, $lastName: String!) {
  createSequelEmployee(firtName: $firtName, lastName: $lastName)
}

query getSequelCompany {
  sequelCompany(id: 1) {
    id
    name
    employees {
      id
      firstName
      lastName
    }
  }
  sequelEmployee(id: 2) {
    id
    firstName
    lastName
  }
}`;

const exampleQueries = graphqlPath => {
  return [
    {
      endpoint: `${graphqlPath}`,
      name: 'Sample',
      query: sampleQueries,
    },
  ];
};

export { exampleQueries };
