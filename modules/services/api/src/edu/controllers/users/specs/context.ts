import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
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
};

export const createContext = async (
  app: INestApplication,
): Promise<Context> => {
  const rolesService = app.get(RolesService);
  const schoolsService = app.get(SchoolsService);
  const usersService = app.get(UsersService);

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
    permissions: ['users:read'],
  });

  const twoAdmin = await rolesService.create({
    name: 'Org Two Admin',
    description: 'Organization Two Admin',
    schoolId: two.id,
    permissions: ['users:read'],
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
  };
};
