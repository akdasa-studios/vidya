import { faker } from '@faker-js/faker';
import { UserPermissions } from '@vidya/api/auth/utils';
import {
  Permision,
  PermissionActions,
  PermissionResources,
} from '@vidya/domain';
import { Organization } from '@vidya/entities';

import { OrganizationsService } from '../../services';

export type Context = {
  orgs: {
    first: Organization;
    second: Organization;
  };
  permissions: {
    no: UserPermissions;
    readFirst: UserPermissions;
    readSecond: UserPermissions;
    updateFirst: UserPermissions;
    deleteFirst: UserPermissions;
    create: UserPermissions;
  };
};

export const createContext = async (
  orgsService: OrganizationsService,
): Promise<Context> => {
  const orgFirst = await orgsService.create({
    name: faker.company.name(),
  });
  const orgSecond = await orgsService.create({
    name: faker.company.name(),
  });

  const permissions = {
    no: new UserPermissions([]),
    readFirst: new UserPermissions([
      {
        oid: orgFirst.id,
        p: [
          Permision(PermissionResources.Organization, PermissionActions.Read),
        ],
      },
    ]),
    readSecond: new UserPermissions([
      {
        oid: orgSecond.id,
        p: [
          Permision(PermissionResources.Organization, PermissionActions.Read),
        ],
      },
    ]),
    updateFirst: new UserPermissions([
      {
        oid: orgFirst.id,
        p: [
          Permision(PermissionResources.Organization, PermissionActions.Update),
        ],
      },
    ]),
    deleteFirst: new UserPermissions([
      {
        oid: orgFirst.id,
        p: [
          Permision(PermissionResources.Organization, PermissionActions.Delete),
        ],
      },
    ]),
    create: new UserPermissions([
      {
        p: [
          Permision(PermissionResources.Organization, PermissionActions.Create),
        ],
      },
    ]),
  };

  return {
    orgs: {
      first: orgFirst,
      second: orgSecond,
    },
    permissions,
  };
};
