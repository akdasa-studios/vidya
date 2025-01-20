import { Organization, School } from "@vidya/entities";
import { QueryFailedError } from "typeorm";
import { dataSource } from "../helpers/dataSource";


describe('School', () => {
  let org: Organization;

  beforeEach(async () => {
    org = new Organization();
    org.name = 'organization';
    await dataSource.manager.save(org);
  });


  test('should create a school', async () => {
    // Arrange
    const school = new School();
    school.name = 'test';
    school.organization = org;

    // Act
    const result = await dataSource.manager.save(school);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.organizationId).toBe(org.id);
    expect(result.organization.name).toBe(org.name);
  });


  test('should raise error if no organization specified', async () => {
    // Arrange
    const school = new School();
    school.name = 'test';

    // Act
    const save = async () => await dataSource.manager.save(school);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  })
});
