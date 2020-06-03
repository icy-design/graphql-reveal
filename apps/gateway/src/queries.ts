const sampleQueries = `mutation createEmployee($firtName: String!, $lastName: String!) {
  createEmployee(firtName: $firtName, lastName: $lastName)
}

query getCompany {
  company(id: 1) {
    id
    name
    employees {
      id
      firstName
      lastName
    }
  }
  employee(id: 2) {
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
