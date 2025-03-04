import { faker } from '@faker-js/faker';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@vidya/api/app.module';
import { OtpService, RevokedTokensService } from '@vidya/api/auth/services';
import { UserPermissions } from '@vidya/api/auth/utils';
import { OrganizationsService } from '@vidya/api/edu/services';
import { inMemoryDataSource } from '@vidya/api/utils';
import { Organization } from '@vidya/entities';
import { useContainer } from 'class-validator';
import { DataSource } from 'typeorm';

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
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DataSource)
    .useValue(await inMemoryDataSource())
    .overrideProvider(OtpService)
    .useValue({ validate: jest.fn() })
    .overrideProvider(RevokedTokensService)
    .useValue({ isRevoked: jest.fn() })
    .compile();

  const app = module.createNestApplication();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.init();
  return app;
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
        p: ['orgs:read'],
      },
    ]),
    readSecond: new UserPermissions([
      {
        oid: orgSecond.id,
        p: ['orgs:read'],
      },
    ]),
    updateFirst: new UserPermissions([
      {
        oid: orgFirst.id,
        p: ['orgs:update'],
      },
    ]),
    deleteFirst: new UserPermissions([
      {
        oid: orgFirst.id,
        p: ['orgs:delete'],
      },
    ]),
    create: new UserPermissions([
      {
        p: ['orgs:create'],
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
