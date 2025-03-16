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
    users: {
      admin: User;
    };
    roles: {
      admin: Role;
      readonly: Role;
    };
  };
  two: {
    school: School;
    roles: {
      admin: Role;
    };
  };
  empty: {
    user: User;
  };
};

export const createContext = async (
  app: INestApplication,
): Promise<Context> => {
  const rolesService = app.get(RolesService);
  const schoolsService = app.get(SchoolsService);
  const usersService = app.get(UsersService);

  /* -------------------------------------------------------------------------- */
  /*                                   Schools                                  */
  /* -------------------------------------------------------------------------- */

  const schoolOne = await schoolsService.create({
    name: faker.company.name(),
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
    permissions: [
      'schools:create',
      'schools:read',
      'schools:update',
      'schools:delete',
    ],
    schoolId: schoolOne.id,
  });

  const oneReadonlyRole = await rolesService.create({
    name: 'One :: Readonly',
    description: 'Readonly role for school one',
    permissions: ['schools:read'],
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

  const oneAdminUser = await usersService.create({
    email: faker.internet.email(),
    roles: [oneAdminRole],
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
        admin: oneAdminUser,
      },
      roles: {
        admin: oneAdminRole,
        readonly: oneReadonlyRole,
      },
    },
    two: {
      school: schoolTwo,
      roles: {
        admin: twoAdminRole,
      },
    },
    empty: {
      user: emptyUser,
    },
  };
};
