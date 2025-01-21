import { Organization, School } from "@vidya/entities";
import { dataSource } from "../helpers/dataSource";

describe('Organization', () => {
  test('should create an organization', async () => {
    // Arrange
    const org = new Organization();
    org.name = 'Test Organization';

    // Act
    const result = await dataSource.manager.save(org);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Test Organization');
  });

  test('should retrieve related schools', async () => {
    // Arrange
    const org = new Organization();
    org.name = 'Test Organization';
    await dataSource.manager.save(org);

    const school1 = new School();
    school1.name = 'School 1';
    school1.organization = org;
    await dataSource.manager.save(school1);

    const school2 = new School();
    school2.name = 'School 2';
    school2.organization = org;
    await dataSource.manager.save(school2);

    // Act
    const savedOrg = await dataSource.getRepository(Organization).findOne({
      where: { name: 'Test Organization' },
      relations: ['schools']
    });

    // Assert
    expect(savedOrg).toBeDefined();
    expect(savedOrg?.schools).toHaveLength(2);
    expect(savedOrg?.schools.map(s => s.name)).toEqual(['School 1', 'School 2']);
    expect(savedOrg?.schools.map(s => s.organizationId)).toEqual([org.id, org.id]);
  });
});
