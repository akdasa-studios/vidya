import { faker } from '@faker-js/faker';

import { OrganizationsService } from '../../../services';
import { OrganizationsController } from '../organizations.controller';
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
  /*                            Create Organization                             */
  /* -------------------------------------------------------------------------- */

  describe('createOrganization', () => {
    it('should create an organization', async () => {
      const response = await ctr.createOrganization(
        { name: faker.company.name() },
        ctx.permissions.create,
      );

      expect(response.id).toBeDefined();
    });

    it('should throw an error if user does not have permissions', async () => {
      await expect(async () => {
        await ctr.createOrganization(
          { name: faker.company.name() },
          ctx.permissions.no,
        );
      }).rejects.toThrow();
    });
  });
});
