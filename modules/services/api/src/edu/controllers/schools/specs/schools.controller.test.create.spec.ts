import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { SchoolsController } from '@vidya/api/edu/controllers';
import * as dto from '@vidya/api/edu/dto';
import { RolesService, SchoolsService } from '@vidya/api/edu/services';
import { createTestingApp } from '@vidya/api/edu/shared';

import { Context, createContext } from './context';

describe('SchoolsController', () => {
  let app: INestApplication;
  let ctx: Context;
  let ctr: SchoolsController;

  beforeEach(async () => {
    app = await createTestingApp();
    ctx = await createContext(app);
    ctr = app.get(SchoolsController);
  });

  /* -------------------------------------------------------------------------- */
  /*                                  Create One                                */
  /* -------------------------------------------------------------------------- */

  describe('createOne', () => {
    it('creates a new school', async () => {
      const name = faker.company.name();
      const res = await ctr.createOne(
        new dto.CreateSchoolRequest({ name }),
        await ctx.authenticate(ctx.one.users.owner),
      );

      // assert: school is created
      const createdSchool = await app
        .get(SchoolsService)
        .findOneBy({ id: res.id });

      expect(createdSchool).toBeDefined();
      expect(createdSchool.name).toBe(name);

      // assert: new owner role is created
      const createdAdminRole = await app
        .get(RolesService)
        .findOneBy({ schoolId: res.id });

      expect(createdAdminRole).toBeDefined();
      expect(createdAdminRole.name).toBe('Owner');
      expect(createdAdminRole.permissions).toEqual(['*']);

      // assert: user has the new owner role
      const userRoles = await app
        .get(RolesService)
        .getRolesOfUser(ctx.one.users.owner.id);

      expect(userRoles).toEqual([ctx.one.roles.owner, createdAdminRole]);
    });

    it('creates a new school for user from another school', async () => {
      const res = await ctr.createOne(
        new dto.CreateSchoolRequest({ name: faker.company.name() }),
        await ctx.authenticate(ctx.one.users.owner),
      );

      // assert: new owner role is created
      const createdAdminRole = await app
        .get(RolesService)
        .findOneBy({ schoolId: res.id });

      // assert: user has the new owner role
      const userRoles = await app
        .get(RolesService)
        .getRolesOfUser(ctx.one.users.owner.id);

      expect(userRoles).toEqual([ctx.one.roles.owner, createdAdminRole]);
    });

    it('throws an error if user does not have required permissions', async () => {
      await expect(async () => {
        await ctr.createOne(
          new dto.CreateSchoolRequest({ name: faker.company.name() }),
          await ctx.authenticate(ctx.misc.users.empty),
        );
      }).rejects.toThrow(`User does not have permission`);
    });
  });
});
