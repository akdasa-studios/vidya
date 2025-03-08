import { faker } from '@faker-js/faker';
import { OrganizationsController } from '@vidya/api/edu/controllers';
import { createTestingApp } from '@vidya/api/utils';

import { Context, createContext } from './context';

describe('OrganizationsController', () => {
  let ctx: Context;
  let ctr: OrganizationsController;

  beforeEach(async () => {
    const app = await createTestingApp();
    ctr = app.get(OrganizationsController);
    ctx = await createContext(app);
  });

  /* -------------------------------------------------------------------------- */
  /*                             Update Organization                            */
  /* -------------------------------------------------------------------------- */

  describe('updateOrganization', () => {
    it('should update an organization', async () => {
      const updatedName = faker.company.name() + ' Updated';
      const response = await ctr.updateOne(
        { name: updatedName },
        ctx.one.org.id,
        ctx.one.permissions.admin,
      );

      // assert
      expect(response.name).toEqual(updatedName);
    });

    it('should throw an error if organization does not exist', async () => {
      await expect(
        async () =>
          await ctr.updateOne(
            { name: 'Updated Org 1' },
            faker.string.uuid(),
            ctx.one.permissions.admin,
          ),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      await expect(
        async () =>
          await ctr.updateOne(
            { name: 'Updated Org 1' },
            ctx.two.org.id,
            ctx.one.permissions.admin,
          ),
      ).rejects.toThrow();
    });
  });
});
