import { INestApplication } from '@nestjs/common';
import { SchoolsController } from '@vidya/api/edu/controllers';
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
  /*                                   Delete                                   */
  /* -------------------------------------------------------------------------- */

  describe('delete', () => {
    it('deletes a school by Id', async () => {
      const res = await ctr.deleteOne(
        ctx.one.school.id,
        await ctx.authenticate(ctx.one.users.admin),
      );
      expect(res.success).toBe(true);
    });

    it('throws error if access is not permitted', async () => {
      await expect(async () => {
        await ctr.deleteOne(
          ctx.one.school.id,
          await ctx.authenticate(ctx.two.users.admin),
        );
      }).rejects.toThrow(`School with id ${ctx.one.school.id} not found`);
    });

    it('throws error for user without any permissions', async () => {
      await expect(async () => {
        await ctr.deleteOne(
          ctx.one.school.id,
          await ctx.authenticate(ctx.misc.users.empty),
        );
      }).rejects.toThrow(`User does not have permission`);
    });
  });
});
