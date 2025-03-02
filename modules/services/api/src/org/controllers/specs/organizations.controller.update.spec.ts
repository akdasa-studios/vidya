import { faker } from '@faker-js/faker';

import { OrganizationsService } from '../../services';
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
  /*                             Update Organization                            */
  /* -------------------------------------------------------------------------- */

  describe('updateOrganization', () => {
    it('should update an organization', async () => {
      const updatedName = faker.company.name() + ' Updated';
      const response = await ctr.updateOrganization(
        { name: updatedName },
        ctx.orgs.first.id,
        ctx.permissions.updateFirst,
      );

      // assert
      expect(response.name).toEqual(updatedName);
    });

    it('should throw an error if organization does not exist', async () => {
      await expect(
        async () =>
          await ctr.updateOrganization(
            { name: 'Updated Org 1' },
            faker.string.uuid(),
            ctx.permissions.updateFirst,
          ),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      await expect(
        async () =>
          await ctr.updateOrganization(
            { name: 'Updated Org 1' },
            ctx.orgs.second.id,
            ctx.permissions.updateFirst,
          ),
      ).rejects.toThrow();
    });
  });
});
