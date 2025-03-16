import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { RolesService, SchoolsService } from '@vidya/api/edu/services';
import { Role, School } from '@vidya/entities';

export type Context = {
  one: {
    school: School;
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
};

export const createContext = async (
  app: INestApplication,
): Promise<Context> => {
  const rolesService = app.get(RolesService);
  const schoolsService = app.get(SchoolsService);

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
    permissions: ['schools:read', 'schools:update'],
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
    permissions: ['schools:read', 'schools:update'],
    schoolId: schoolTwo.id,
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Result                                   */
  /* -------------------------------------------------------------------------- */

  return {
    one: {
      school: schoolOne,
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
  };
};
