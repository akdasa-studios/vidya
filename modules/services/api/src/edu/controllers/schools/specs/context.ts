import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService, AuthUsersService } from '@vidya/api/auth/services';
import { UserAuthentication } from '@vidya/api/auth/utils';
import {
  RolesService,
  SchoolsService,
  UsersService,
} from '@vidya/api/edu/services';
import { Role, School, User } from '@vidya/entities';

export type Context = {
  one: {
    school: School;
    users: {
      owner: User;
      readonly: User;
      empty: User;
    };
    roles: {
      owner: Role;
      readonly: Role;
      empty: Role;
    };
  };
  two: {
    school: School;
    users: {
      admin: User;
    };
    roles: {
      admin: Role;
    };
  };
  misc: {
    users: {
      empty: User;
      adminOfOneAndTwo: User;
    };
  };
  authenticate(user: User): Promise<UserAuthentication>;
  getAuthTokenFor(user: User): Promise<string>;
};

export const createContext = async (
  app: INestApplication,
): Promise<Context> => {
  const rolesService = app.get(RolesService);
  const schoolsService = app.get(SchoolsService);
  const usersService = app.get(UsersService);
  const authUsersService = app.get(AuthUsersService);
  const authService = app.get(AuthService);

  /* -------------------------------------------------------------------------- */
  /*                                   Schools                                  */
  /* -------------------------------------------------------------------------- */

  const schoolOne = await schoolsService.create({
    name: faker.company.name(),
    config: {
      defaultStudentRoleId: faker.string.uuid(),
    },
  });

  const schoolTwo = await schoolsService.create({
    name: faker.company.name(),
  });

  /* -------------------------------------------------------------------------- */
  /*                                    Roles                                   */
  /* -------------------------------------------------------------------------- */

  const oneAdminRole = await rolesService.create({
    name: 'One :: Admin',
    description: 'Admin role for school one',
    permissions: ['*'],
    schoolId: schoolOne.id,
  });

  const oneReadonlyRole = await rolesService.create({
    name: 'One :: Readonly',
    description: 'Readonly role for school one',
    permissions: ['schools:read'],
    schoolId: schoolOne.id,
  });

  const oneEmptyRole = await rolesService.create({
    name: 'One :: Empty',
    description: 'Empty role for school one',
    permissions: [],
    schoolId: schoolOne.id,
  });

  const twoAdminRole = await rolesService.create({
    name: 'Two :: Admin',
    description: 'Admin role for school two',
    permissions: [
      'schools:create',
      'schools:read',
      'schools:update',
      'schools:delete',
    ],
    schoolId: schoolTwo.id,
  });

  /* -------------------------------------------------------------------------- */
  /*                                    Users                                   */
  /* -------------------------------------------------------------------------- */

  const oneOwnerUser = await usersService.create({
    email: faker.internet.email(),
    roles: [oneAdminRole],
  });

  const oneReadonlyUser = await usersService.create({
    email: faker.internet.email(),
    roles: [oneReadonlyRole],
  });

  const oneEmptyUser = await usersService.create({
    email: faker.internet.email(),
    roles: [oneEmptyRole],
  });

  const twoAdminUser = await usersService.create({
    email: faker.internet.email(),
    roles: [twoAdminRole],
  });

  const adminOfOneAndTwoUser = await usersService.create({
    email: faker.internet.email(),
    roles: [oneAdminRole, twoAdminRole],
  });

  const emptyUser = await usersService.create({
    email: faker.internet.email(),
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Result                                   */
  /* -------------------------------------------------------------------------- */

  return {
    one: {
      school: schoolOne,
      users: {
        owner: oneOwnerUser,
        readonly: oneReadonlyUser,
        empty: oneEmptyUser,
      },
      roles: {
        owner: oneAdminRole,
        readonly: oneReadonlyRole,
        empty: oneEmptyRole,
      },
    },
    two: {
      school: schoolTwo,
      users: {
        admin: twoAdminUser,
      },
      roles: {
        admin: twoAdminRole,
      },
    },
    misc: {
      users: {
        adminOfOneAndTwo: adminOfOneAndTwoUser,
        empty: emptyUser,
      },
    },
    async authenticate(user) {
      return new UserAuthentication({
        sub: user.id,
        jti: faker.string.uuid(),
        exp: faker.date.future({ years: 1 }).getTime(),
        iat: Date.now(),
        permissions: await authUsersService.getUserPermissions(user.id),
      });
    },
    async getAuthTokenFor(user: User) {
      const tokens = await authService.generateTokens(
        user.id,
        await authUsersService.getUserPermissions(user.id),
      );
      return `Bearer ${tokens.accessToken}`;
    },
  };
};
