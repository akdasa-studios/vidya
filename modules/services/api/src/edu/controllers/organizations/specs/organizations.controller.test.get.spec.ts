import { faker } from '@faker-js/faker';
import { OrganizationsController } from '@vidya/api/edu/controllers';
import { createTestingApp } from '@vidya/api/edu/shared';

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
  /*                              Get Organizations                             */
  /* -------------------------------------------------------------------------- */

  describe('getOrganizations', () => {
    it('should return an empty array if no permissions granted', async () => {
      const res = await ctr.getMany(ctx.empty.permissions.no);
      expect(res.items).toEqual([]);
    });

    it('should return all permitted organizations', async () => {
      const res = await ctr.getMany(ctx.one.permissions.admin);
      expect(res.items).toEqual([ctx.one.org]);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                              Get Organization                              */
  /* -------------------------------------------------------------------------- */

  describe('getOrganization', () => {
    it('should return permitted organization', async () => {
      const res = await ctr.getOne(ctx.one.org.id, ctx.one.permissions.admin);
      expect(res).toEqual(ctx.one.org);
    });

    it('should throw an error if no permissions', async () => {
      await expect(
        async () => await ctr.getOne(ctx.one.org.id, ctx.empty.permissions.no),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      await expect(async () => {
        return await ctr.getOne(faker.string.uuid(), ctx.one.permissions.admin);
      }).rejects.toThrow();
    });
  });
});
