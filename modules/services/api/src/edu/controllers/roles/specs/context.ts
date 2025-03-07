import { faker } from '@faker-js/faker';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@vidya/api/app.module';
import { OtpService, RevokedTokensService } from '@vidya/api/auth/services';
import { UserPermissions } from '@vidya/api/auth/utils';
import {
  OrganizationsService,
  RolesService,
  SchoolsService,
} from '@vidya/api/edu/services';
import { inMemoryDataSource } from '@vidya/api/utils';
import { Organization, Role, School } from '@vidya/entities';
import { useContainer } from 'class-validator';
import { DataSource } from 'typeorm';

// TODO !HIGH extract to shared context
export type Context = {
  orgs: {
    first: Organization;
    second: Organization;
  };
  schools: {
    one: School;
  };
  roles: {
    orgOneAdmin: Role;
    orgTwoAdmin: Role;
    orgOneScoolOneAdmin: Role;
  };
  permissions: {
    no: UserPermissions;
    readFirst: UserPermissions;
    readSecond: UserPermissions;
    updateFirst: UserPermissions;
    deleteFirst: UserPermissions;
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
  schoolsService: SchoolsService,
  rolesService: RolesService,
): Promise<Context> => {
  const orgFirst = await orgsService.create({
    name: faker.company.name(),
  });
  const orgSecond = await orgsService.create({
    name: faker.company.name(),
  });

  const schoolOne = await schoolsService.create({
    name: faker.company.name(),
    organizationId: orgFirst.id,
  });

  const orgOneAdmin = await rolesService.create({
    name: 'Org One :: Admin',
    description: 'Org One :: Admin role',
    permissions: ['orgs:read', 'orgs:update', 'orgs:delete'],
    organizationId: orgFirst.id,
  });
  const orgTwoAdmin = await rolesService.create({
    name: 'Org Two :: Admin',
    description: 'Org Two :: Admin role',
    permissions: ['orgs:read', 'orgs:update', 'orgs:delete'],
    organizationId: orgSecond.id,
  });
  const orgOneScoolOneAdmin = await rolesService.create({
    name: 'Org One :: School One :: Admin',
    description: 'Org One :: School One :: Admin role',
    permissions: ['roles:read'],
    organizationId: orgFirst.id,
    schoolId: schoolOne.id,
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
  };

  return {
    orgs: {
      first: orgFirst,
      second: orgSecond,
    },
    schools: {
      one: schoolOne,
    },
    roles: {
      orgOneAdmin,
      orgTwoAdmin,
      orgOneScoolOneAdmin,
    },
    permissions,
  };
};
