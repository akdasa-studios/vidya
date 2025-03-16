import { INestApplication } from '@nestjs/common';
import { UserPermissions } from '@vidya/api/auth/utils';
import { SchoolsController } from '@vidya/api/edu/controllers';
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
  /*                                   Delete                                   */
  /* -------------------------------------------------------------------------- */

  describe('delete', () => {
    it('deletes a school by Id', async () => {
      const res = await ctr.deleteOne(
        ctx.one.school.id,
        getPermissions([ctx.one.roles.admin]),
      );
      expect(res.success).toBe(true);
    });

    it('throws error if access is not permitted', async () => {
      await expect(async () => {
        await ctr.deleteOne(
          ctx.one.school.id,
          getPermissions([ctx.two.roles.admin]),
        );
      }).rejects.toThrow(`School with id ${ctx.one.school.id} not found`);
    });

    it('throws error for user without any permissions', async () => {
      await expect(async () => {
        await ctr.deleteOne(ctx.one.school.id, new UserPermissions([]));
      }).rejects.toThrow(`User does not have permission`);
    });
  });
});
