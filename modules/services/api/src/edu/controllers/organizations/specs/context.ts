import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import { UserPermissions } from '@vidya/api/auth/utils';
import { OrganizationsService } from '@vidya/api/edu/services';
import { Organization } from '@vidya/entities';

export type Context = {
  one: {
    org: Organization;
    permissions: {
      admin: UserPermissions;
    };
    tokens: {
      admin: string;
      readOnly: string;
    };
  };
  two: {
    org: Organization;
    tokens: {
      admin: string;
    };
  };
  empty: {
    permissions: {
      no: UserPermissions;
    };
    tokens: {
      noPermissions: string;
    };
  };
};

export const createContext = async (
  app: INestApplication,
): Promise<Context> => {
  const orgsService = app.get(OrganizationsService);
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

  /* -------------------------------------------------------------------------- */
  /*                                 Permissions                                */
  /* -------------------------------------------------------------------------- */

  const orgOnePermissionsAdmin = new UserPermissions([
    { oid: orgsOne.id, p: ['orgs:delete', 'orgs:read', 'orgs:update'] },
  ]);

  const emptyPermissionsNo = new UserPermissions([]);

  /* -------------------------------------------------------------------------- */
  /*                                   Tokens                                   */
  /* -------------------------------------------------------------------------- */

  const orgOneTokenAdmin = await authService.generateTokens(
    faker.string.uuid(),
    [{ oid: orgsOne.id, p: ['orgs:delete', 'orgs:read', 'orgs:update'] }],
  );

  const orgOneTokenReadonly = await authService.generateTokens(
    faker.string.uuid(),
    [{ oid: orgsOne.id, p: ['orgs:read'] }],
  );

  const orgTwoTokenAdmin = await authService.generateTokens(
    faker.string.uuid(),
    [{ oid: orgsTwo.id, p: ['orgs:delete', 'orgs:read', 'orgs:update'] }],
  );

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
      permissions: {
        admin: orgOnePermissionsAdmin,
      },
      tokens: {
        admin: orgOneTokenAdmin.accessToken,
        readOnly: orgOneTokenReadonly.accessToken,
      },
    },
    two: {
      org: orgsTwo,
      tokens: {
        admin: orgTwoTokenAdmin.accessToken,
      },
    },
    empty: {
      permissions: {
        no: emptyPermissionsNo,
      },
      tokens: {
        noPermissions: emptyTokenNoPermissions.accessToken,
      },
    },
  };
};
