import { range } from 'lodash';

const faker = require('faker');

const Count = 5;
const NumCompanies = 20;
const NumEmployees = NumCompanies * Count;

const companyId = 1591670061401;
const companies = range(NumCompanies).map(i => {
  return {
    id: companyId + i,
    name: faker.company.companyName(),
    phrase: faker.company.catchPhrase(),
    info: 999
  };
});

const employeeId = 1591670061501;
const employees = range(NumEmployees).map(i => {
  const company = companies[Math.floor(i / 5)];
  return {
    id: employeeId + i,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    address: faker.address.city(),
    owner: i % Count === 0? company.id : null, // for every counted
    employerId: company.id,
    supervisorId: i % Count !== 0? employeeId + i - (i % Count) : null
  };
});

export const Seeds = { company: companies, employee: employees }