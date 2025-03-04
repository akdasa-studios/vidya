import { faker } from '@faker-js/faker';
import { OrganizationsController } from '@vidya/api/edu/controllers';
import { OrganizationsService } from '@vidya/api/edu/services';

import { Context, createContext, createModule } from './context';

describe('OrganizationsController', () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */

  let ctx: Context;
  let ctr: OrganizationsController;

  /* -------------------------------------------------------------------------- */
  /*                                 Before Each                                */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    const module = await createModule();
    ctr = module.get(OrganizationsController);
    ctx = await createContext(module.get(OrganizationsService));
  });

  /* -------------------------------------------------------------------------- */
  /*                             Delete Organization                            */
  /* -------------------------------------------------------------------------- */

  describe('deleteOrganization', () => {
    it('should delete an organization', async () => {
      const response = await ctr.deleteOrganization(
        ctx.orgs.first.id,
        ctx.permissions.deleteFirst,
      );
      expect(response.success).toBeTruthy();
    });

    it('should throw an error if user does not have permissions', async () => {
      await expect(
        async () =>
          await ctr.deleteOrganization(
            ctx.orgs.second.id,
            ctx.permissions.deleteFirst,
          ),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      await expect(
        async () =>
          await ctr.deleteOrganization(
            faker.string.uuid(),
            ctx.permissions.deleteFirst,
          ),
      ).rejects.toThrow();
    });
  });
});
