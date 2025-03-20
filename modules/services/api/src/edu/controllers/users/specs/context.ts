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
    roles: {
      oneAdmin: Role;
    };
    users: {
      oneAdmin: User;
    };
    tokens: {
      oneAdmin: string;
    };
  };
  two: {
    school: School;
    roles: {
      twoAdmin: Role;
    };
    users: {
      twoAdmin: User;
    };
  };
  misc: {
    users: {
      empty: User;
      adminOfOneAndTwo: User;
    };
    tokens: {
      dummy: string;
      empty: string;
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
  const authService = app.get(AuthService);
  const authUsersService = app.get(AuthUsersService);

  /* -------------------------------------------------------------------------- */
  /*                                Organizations                               */
  /* -------------------------------------------------------------------------- */

  const one = await schoolsService.create({
    name: 'Org One',
  });

  const two = await schoolsService.create({
    name: 'Org Two',
  });

  /* -------------------------------------------------------------------------- */
  /*                                    Roles                                   */
  /* -------------------------------------------------------------------------- */

  const orgAdmin = await rolesService.create({
    name: 'Org Admin',
    description: 'Organization Admin',
    schoolId: one.id,
    permissions: ['users:read', 'users:update', 'users:delete'],
  });

  const twoAdmin = await rolesService.create({
    name: 'Org Two Admin',
    description: 'Organization Two Admin',
    schoolId: two.id,
    permissions: ['users:read', 'users:update', 'users:delete'],
  });

  /* -------------------------------------------------------------------------- */
  /*                                    Users                                   */
  /* -------------------------------------------------------------------------- */

  const orgAdminUser = await usersService.create({
    name: 'Org Admin',
    email: faker.internet.email(),
    roles: [orgAdmin],
  });

  const twoAdminUser = await usersService.create({
    name: 'Org Two Admin',
    email: faker.internet.email(),
    roles: [twoAdmin],
  });

  const adminOfOneAndTwoUser = await usersService.create({
    name: 'Admin of One and Two',
    email: faker.internet.email(),
    roles: [orgAdmin, twoAdmin],
  });

  const emptyUser = await usersService.create({
    name: 'Empty User',
    email: faker.internet.email(),
    roles: [],
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Tokens                                   */
  /* -------------------------------------------------------------------------- */

  const oneAdminToken = await authService.generateTokens(orgAdminUser.id, [
    { sid: one.id, p: orgAdmin.permissions },
  ]);

  const dummyToken = await authService.generateTokens(faker.string.uuid(), [
    { sid: faker.string.uuid(), p: ['users:read'] },
  ]);

  const emptyToken = await authService.generateTokens(faker.string.uuid(), []);

  /* -------------------------------------------------------------------------- */
  /*                                   Return                                   */
  /* -------------------------------------------------------------------------- */

  return {
    one: {
      school: one,
      roles: {
        oneAdmin: orgAdmin,
      },
      users: {
        oneAdmin: orgAdminUser,
      },
      tokens: {
        oneAdmin: oneAdminToken.accessToken,
      },
    },
    two: {
      school: two,
      roles: {
        twoAdmin: twoAdmin,
      },
      users: {
        twoAdmin: twoAdminUser,
      },
    },
    misc: {
      users: {
        empty: emptyUser,
        adminOfOneAndTwo: adminOfOneAndTwoUser,
      },
      tokens: {
        dummy: dummyToken.accessToken,
        empty: emptyToken.accessToken,
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
