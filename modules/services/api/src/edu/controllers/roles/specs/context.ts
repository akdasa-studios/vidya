import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import { RolesService, SchoolsService } from '@vidya/api/edu/services';
import { Role, School } from '@vidya/entities';

export type Context = {
  one: {
    school: School;
    roles: {
      admin: Role;
      readonly: Role;
    };
    tokens: {
      admin: string;
      readOnly: string;
      oneAndTwoAdmin: string;
    };
  };
  two: {
    school: School;
    roles: {
      admin: Role;
    };
    tokens: {
      admin: string;
      oneAndTwoAdmin: string;
    };
  };
  three: {
    school: School;
    tokens: {
      admin: string;
    };
  };
  empty: {
    tokens: {
      noPermissions: string;
    };
  };
};

export const createContext = async (
  app: INestApplication,
): Promise<Context> => {
  const rolesService = app.get(RolesService);
  const schoolsService = app.get(SchoolsService);
  const authService = app.get(AuthService);

  /* -------------------------------------------------------------------------- */
  /*                                   Schools                                  */
  /* -------------------------------------------------------------------------- */

  const schoolOne = await schoolsService.create({
    name: faker.company.name(),
  });

  const schoolTwo = await schoolsService.create({
    name: faker.company.name(),
  });

  const schoolThree = await schoolsService.create({
    name: faker.company.name(),
  });

  /* -------------------------------------------------------------------------- */
  /*                                    Roles                                   */
  /* -------------------------------------------------------------------------- */

  const oneAdminRole = await rolesService.create({
    name: 'One :: Admin',
    description: 'Admin role for school one',
    permissions: ['roles:create', 'roles:read', 'roles:update', 'roles:delete'],
    schoolId: schoolOne.id,
  });

  const oneReadonlyRole = await rolesService.create({
    name: 'One :: Readonly',
    description: 'Readonly role for school one',
    permissions: ['roles:read'],
    schoolId: schoolOne.id,
  });

  const twoAdminRole = await rolesService.create({
    name: 'Two :: Admin',
    description: 'Admin role for school two',
    permissions: ['roles:create', 'roles:read', 'roles:update', 'roles:delete'],
    schoolId: schoolTwo.id,
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Tokens                                   */
  /* -------------------------------------------------------------------------- */

  const oneTokenAdmin = await authService.generateTokens(faker.string.uuid(), [
    { sid: schoolOne.id, p: oneAdminRole.permissions },
  ]);

  const oneTokenReadonly = await authService.generateTokens(
    faker.string.uuid(),
    [{ sid: schoolOne.id, p: oneReadonlyRole.permissions }],
  );

  const twoTokenAdmin = await app
    .get(AuthService)
    .generateTokens(faker.string.uuid(), [
      { sid: schoolTwo.id, p: twoAdminRole.permissions },
    ]);

  const threeTokenAdmin = await authService.generateTokens(
    faker.string.uuid(),
    [{ sid: schoolThree.id, p: ['roles:create', 'roles:read'] }],
  );

  const oneAndTwoAdmin = await authService.generateTokens(faker.string.uuid(), [
    { sid: schoolOne.id, p: oneAdminRole.permissions },
    { sid: schoolTwo.id, p: twoAdminRole.permissions },
  ]);

  const emptyTokenNoPermissions = await authService.generateTokens(
    faker.string.uuid(),
    [],
  );

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
      tokens: {
        admin: oneTokenAdmin.accessToken,
        readOnly: oneTokenReadonly.accessToken,
        oneAndTwoAdmin: oneAndTwoAdmin.accessToken,
      },
    },
    two: {
      school: schoolTwo,
      roles: {
        admin: twoAdminRole,
      },
      tokens: {
        admin: twoTokenAdmin.accessToken,
        oneAndTwoAdmin: oneAndTwoAdmin.accessToken,
      },
    },
    three: {
      school: schoolThree,
      tokens: {
        admin: threeTokenAdmin.accessToken,
      },
    },
    empty: {
      tokens: {
        noPermissions: emptyTokenNoPermissions.accessToken,
      },
    },
  };
};
