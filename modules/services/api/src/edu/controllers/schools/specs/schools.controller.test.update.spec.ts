import { INestApplication } from '@nestjs/common';
import { UserPermissions } from '@vidya/api/auth/utils';
import { SchoolsController } from '@vidya/api/edu/controllers';
import * as dto from '@vidya/api/edu/dto';
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
  /*                                   Update                                   */
  /* -------------------------------------------------------------------------- */

  describe('update', () => {
    it('updates a school by Id', async () => {
      const request = new dto.UpdateSchoolRequest({
        name: 'Updated School Name',
      });
      const res = await ctr.updateOne(
        ctx.one.school.id,
        request,
        getPermissions([ctx.one.roles.admin]),
      );
      expect(res.name).toBe(request.name);
    });

    it('throws if access is not permitted', async () => {
      await expect(async () => {
        await ctr.updateOne(
          ctx.one.school.id,
          new dto.UpdateSchoolRequest({ name: 'Updated School Name' }),
          getPermissions([ctx.two.roles.admin]),
        );
      }).rejects.toThrow(`School with id ${ctx.one.school.id} not found`);
    });

    it('throws for user without update permissions', async () => {
      await expect(async () => {
        await ctr.updateOne(
          ctx.one.school.id,
          new dto.UpdateSchoolRequest({ name: 'Updated School Name' }),
          new UserPermissions([]),
        );
      }).rejects.toThrow(`User does not have permission`);
    });
  });
});
