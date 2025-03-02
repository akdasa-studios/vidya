import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { AppModule } from '@vidya/api/app.module';
import { OtpService, RevokedTokensService } from '@vidya/api/auth/services';
import { UserPermissions } from '@vidya/api/auth/utils';
import { inMemoryDataSource } from '@vidya/api/utils';
import {
  Permision,
  PermissionActions,
  PermissionResources,
} from '@vidya/domain';
import { Organization } from '@vidya/entities';
import { DataSource } from 'typeorm';

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

export const createModule = async () => {
  return await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DataSource)
    .useValue(await inMemoryDataSource())
    .overrideProvider(OtpService)
    .useValue({ validate: jest.fn() })
    .overrideProvider(RevokedTokensService)
    .useValue({ isRevoked: jest.fn() })
    .compile();
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
