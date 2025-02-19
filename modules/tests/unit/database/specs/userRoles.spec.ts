import { User, Role, UserRole, Organization } from "@vidya/entities";
import { faker } from '@faker-js/faker';
import { dataSource } from "../helpers/dataSource";

describe('UserRoles', () => {
  let user: User;
  let role: Role;
  let organization: Organization;

  beforeEach(async () => {
    organization = new Organization();
    organization.name = faker.company.name();
    await dataSource.manager.save(organization);

    user = new User();
    user.name = faker.person.fullName();
    user.email = faker.internet.exampleEmail();

    role = new Role();
    role.name = faker.person.jobTitle();
    role.description = faker.lorem.sentence();
    role.permissions = ['perm1', 'perm2'];
    role.organizationId = organization.id;

    await dataSource.manager.save([user, role]);
  });

  test('should create a userRole', async () => {
    const userRole = new UserRole();
    userRole.user = user;
    userRole.role = role;

    // Act
    const result = await dataSource.manager.save(userRole);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.roleId).toBe(role.id);
    expect(result.userId).toBe(user.id);
  });

  test('should fetch userRole with user and role', async () => {
    // arrange
    const userRole = new UserRole();
    userRole.user = user;
    userRole.role = role;
    await dataSource.manager.save(userRole); 

    // act
    const result = await dataSource.manager.getRepository(User).findOneOrFail({ 
      where: { id: user.id }, 
      relations: ['userRoles', 'roles']
    });

    // assert
    expect(result).toBeDefined();
    expect(result.userRoles).toBeDefined();
    expect(result.userRoles.length).toBe(1);
    expect(result.roles.length).toBe(1);
  });
});
