import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
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
  empty: {
    tokens: {
      dummy: string;
      empty: string;
    };
  };
};

export const createContext = async (
  app: INestApplication,
): Promise<Context> => {
  const rolesService = app.get(RolesService);
  const schoolsService = app.get(SchoolsService);
  const usersService = app.get(UsersService);
  const authService = app.get(AuthService);

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
    empty: {
      tokens: {
        dummy: dummyToken.accessToken,
        empty: emptyToken.accessToken,
      },
    },
  };
};
