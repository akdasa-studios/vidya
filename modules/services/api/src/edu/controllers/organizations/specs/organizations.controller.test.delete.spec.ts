import { faker } from '@faker-js/faker';
import { OrganizationsController } from '@vidya/api/edu/controllers';
import { createTestingApp } from '@vidya/api/utils';

import { Context, createContext } from './context';

describe('OrganizationsController', () => {
  let ctx: Context;
  let ctr: OrganizationsController;

  beforeEach(async () => {
    const app = await createTestingApp();
    ctx = await createContext(app);
    ctr = app.get(OrganizationsController);
  });

  /* -------------------------------------------------------------------------- */
  /*                             Delete Organization                            */
  /* -------------------------------------------------------------------------- */

  describe('deleteOrganization', () => {
    it('should delete an organization', async () => {
      const response = await ctr.deleteOne(
        ctx.one.org.id,
        ctx.one.permissions.admin,
      );
      expect(response.success).toBeTruthy();
    });

    it('should throw an error if user does not have permissions', async () => {
      await expect(
        async () =>
          await ctr.deleteOne(ctx.two.org.id, ctx.one.permissions.admin),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      await expect(
        async () =>
          await ctr.deleteOne(faker.string.uuid(), ctx.one.permissions.admin),
      ).rejects.toThrow();
    });
  });
});
