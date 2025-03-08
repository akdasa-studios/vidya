import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import {
  OrganizationsService,
  RolesService,
  SchoolsService,
} from '@vidya/api/edu/services';
import { Organization, Role, School } from '@vidya/entities';

export type Context = {
  one: {
    org: Organization;
    roles: {
      admin: Role;
      readonly: Role;
      schoolLevelReadonly: Role;
    };
    schools: {
      one: School;
    };
    tokens: {
      admin: string;
      readOnly: string;
      schoolLevelAdmin: string;
      schoolLevelReadonly: string;
    };
  };
  two: {
    org: Organization;
    roles: {
      admin: Role;
    };
    tokens: {
      admin: string;
    };
  };
  three: {
    org: Organization;
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
  const orgsService = app.get(OrganizationsService);
  const rolesService = app.get(RolesService);
  const schoolsService = app.get(SchoolsService);
  const authService = app.get(AuthService);

  /* -------------------------------------------------------------------------- */
  /*                                Organizations                               */
  /* -------------------------------------------------------------------------- */

  const orgsOne = await orgsService.create({
    name: faker.company.name(),
  });

  const orgsTwo = await orgsService.create({
    name: faker.company.name(),
  });

  const orgsThree = await orgsService.create({
    name: faker.company.name(),
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Schools                                  */
  /* -------------------------------------------------------------------------- */

  const orgOneSchooleOne = await schoolsService.create({
    name: faker.company.name(),
    organizationId: orgsOne.id,
  });

  /* -------------------------------------------------------------------------- */
  /*                                    Roles                                   */
  /* -------------------------------------------------------------------------- */

  const orgOneRoleAdmin = await rolesService.create({
    name: 'Org One :: Admin',
    description: 'Org One :: Admin role',
    permissions: ['roles:create', 'roles:read', 'roles:update', 'roles:delete'],
    organizationId: orgsOne.id,
  });

  const orgOneRoleReadonly = await rolesService.create({
    name: 'Org One :: Readonly',
    description: 'Org One :: Readonly role',
    permissions: ['roles:read'],
    organizationId: orgsOne.id,
  });

  const orgOneRoleSchoolLevelReadonly = await rolesService.create({
    name: 'Org One :: School Level Readonly',
    description: 'Org One :: School Level Readonly role',
    permissions: ['roles:read'],
    organizationId: orgsOne.id,
    schoolId: orgOneSchooleOne.id,
  });

  const orgTwoRoleAdmin = await rolesService.create({
    name: 'Org Two :: Admin',
    description: 'Org Two :: Admin role',
    permissions: ['roles:create', 'roles:read', 'roles:update', 'roles:delete'],
    organizationId: orgsTwo.id,
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Tokens                                   */
  /* -------------------------------------------------------------------------- */

  const orgOneTokenReadonly = await authService.generateTokens(
    faker.string.uuid(),
    [{ oid: orgsOne.id, p: orgOneRoleReadonly.permissions }],
  );

  const orgOneTokenAdmin = await authService.generateTokens(
    faker.string.uuid(),
    [{ oid: orgsOne.id, p: orgOneRoleAdmin.permissions }],
  );

  const orgOneTokenSchoolLevelAdmin = await authService.generateTokens(
    faker.string.uuid(),
    [
      {
        oid: orgsOne.id,
        sid: orgOneSchooleOne.id,
        p: ['roles:create', 'roles:read', 'roles:update', 'roles:delete'],
      },
    ],
  );

  const orgOneTokenSchoolLevelReadonly = await authService.generateTokens(
    faker.string.uuid(),
    [
      {
        oid: orgsOne.id,
        sid: orgOneSchooleOne.id,
        p: orgOneRoleSchoolLevelReadonly.permissions,
      },
    ],
  );

  const orgThreeTokenAdmin = await authService.generateTokens(
    faker.string.uuid(),
    [{ oid: orgsThree.id, p: ['roles:create', 'roles:read'] }],
  );

  const orgTwoTokenAdmin = await app
    .get(AuthService)
    .generateTokens(faker.string.uuid(), [
      { oid: orgsTwo.id, p: orgTwoRoleAdmin.permissions },
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
      org: orgsOne,
      schools: {
        one: orgOneSchooleOne,
      },
      roles: {
        admin: orgOneRoleAdmin,
        readonly: orgOneRoleReadonly,
        schoolLevelReadonly: orgOneRoleSchoolLevelReadonly,
      },
      tokens: {
        admin: orgOneTokenAdmin.accessToken,
        readOnly: orgOneTokenReadonly.accessToken,
        schoolLevelAdmin: orgOneTokenSchoolLevelAdmin.accessToken,
        schoolLevelReadonly: orgOneTokenSchoolLevelReadonly.accessToken,
      },
    },
    two: {
      org: orgsTwo,
      roles: {
        admin: orgTwoRoleAdmin,
      },
      tokens: {
        admin: orgTwoTokenAdmin.accessToken,
      },
    },
    three: {
      org: orgsThree,
      tokens: {
        admin: orgThreeTokenAdmin.accessToken,
      },
    },
    empty: {
      tokens: {
        noPermissions: emptyTokenNoPermissions.accessToken,
      },
    },
  };
};
