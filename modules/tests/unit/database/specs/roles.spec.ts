import { faker } from '@faker-js/faker';
import { Role, Organization, School } from "@vidya/entities";
import { QueryFailedError } from "typeorm";
import { dataSource } from "../helpers/dataSource";

describe('Role', () => {
  let organization: Organization;
  let school: School;

  beforeEach(async () => {
    organization = new Organization();
    organization.name = faker.company.name();
    await dataSource.manager.save(organization);

    school = new School();
    school.name = faker.company.name();
    school.organizationId = organization.id;
    await dataSource.manager.save(school);
  })

  test('should create a role', async () => {
    // Arrange
    const role = new Role();
    role.name = 'test role';
    role.description = 'test description';
    role.permissions = ['read', 'write'];
    role.organizationId = organization.id;
    role.schoolId = school.id;

    // Act
    const result = await dataSource.manager.save(role);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.name).toBe('test role');
    expect(result.description).toBe('test description');
    expect(result.permissions).toEqual(['read', 'write']);
  });

  test('should raise error if name is not specified', async () => {
    // Arrange
    const role = new Role();
    role.description = 'test Role';
    role.organizationId = organization.id;

    // Act
    const save = async () => await dataSource.manager.save(role);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });

  test('should raise error if description is not specified', async () => {
    // Arrange
    const role = new Role();
    role.name = 'test Role';
    role.organizationId = organization.id;

    // Act
    const save = async () => await dataSource.manager.save(role);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });
});
