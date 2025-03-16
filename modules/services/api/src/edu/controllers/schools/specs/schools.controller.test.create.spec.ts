import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { UserPermissions } from '@vidya/api/auth/utils';
import { SchoolsController } from '@vidya/api/edu/controllers';
import * as dto from '@vidya/api/edu/dto';
import { SchoolsService } from '@vidya/api/edu/services';
import { createTestingApp } from '@vidya/api/edu/shared';
import { Role } from '@vidya/entities';

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

  function getPermissions(roles: Role[]): UserPermissions {
    return new UserPermissions(
      roles.map((r) => ({
        sid: r.schoolId,
        p: r.permissions,
      })),
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Create One                                */
  /* -------------------------------------------------------------------------- */

  describe('createOne', () => {
    it('creates a new school', async () => {
      const schoolName = faker.company.name();

      // act
      const res = await ctr.createOne(
        new dto.CreateSchoolRequest({ name: schoolName }),
        getPermissions([ctx.one.roles.admin]),
      );

      // assert: school is created
      const createdSchool = await app
        .get(SchoolsService)
        .findOneBy({ id: res.id });

      expect(createdSchool).toBeDefined();
      expect(createdSchool.name).toBe(schoolName);
    });

    it('throws an error if user does not have permissions', async () => {
      await expect(async () => {
        await ctr.createOne(
          new dto.CreateSchoolRequest({ name: faker.company.name() }),
          new UserPermissions([]),
        );
      }).rejects.toThrow(`User does not have permission`);
    });
  });
});
