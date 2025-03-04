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
  /*                              Get Organizations                             */
  /* -------------------------------------------------------------------------- */

  describe('getOrganizations', () => {
    it('should return an empty array if no permissions granted', async () => {
      const res = await ctr.getOrganizations(ctx.permissions.no);
      expect(res.items).toEqual([]);
    });

    it('should return all permitted organizations', async () => {
      const res = await ctr.getOrganizations(ctx.permissions.readFirst);
      expect(res.items).toEqual([ctx.orgs.first]);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                              Get Organization                              */
  /* -------------------------------------------------------------------------- */

  describe('getOrganization', () => {
    it('should return permitted organization', async () => {
      const res = await ctr.getOrganization(
        ctx.orgs.first.id,
        ctx.permissions.readFirst,
      );

      expect(res).toEqual(ctx.orgs.first);
    });

    it('should throw an error if no permissions', async () => {
      await expect(
        async () =>
          await ctr.getOrganization(ctx.orgs.first.id, ctx.permissions.no),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      await expect(async () => {
        return await ctr.getOrganization(
          faker.string.uuid(),
          ctx.permissions.no,
        );
      }).rejects.toThrow();
    });
  });
});
