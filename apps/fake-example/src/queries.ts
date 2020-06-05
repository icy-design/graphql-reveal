const sampleQueries = `mutation createFakeEmployee($firtName: String!, $lastName: String!) {
  createFakeEmployee(firtName: $firtName, lastName: $lastName)
}

query getFakeCompany {
  fakeCompany(id: 1) {
    id
    name
    employees {
      id
      firstName
      lastName
    }
  }
  fakeEmployee(id: 2) {
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
