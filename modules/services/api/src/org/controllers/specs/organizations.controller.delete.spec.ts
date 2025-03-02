import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@vidya/api/app.module';
import { inMemoryDataSource } from '@vidya/api/utils';
import { DataSource } from 'typeorm';

import { OrganizationsService } from '../../services';
import { OrganizationsController } from '../organizations.controller';
import { Context, createContext } from './context';

describe('OrganizationsController', () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */

  let ctx: Context;
  let ctr: OrganizationsController;
  let module: TestingModule;

  /* -------------------------------------------------------------------------- */
  /*                                 Before Each                                */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(await inMemoryDataSource())
      .compile();

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
      expect(
        async () =>
          await ctr.deleteOrganization(
            ctx.orgs.second.id,
            ctx.permissions.deleteFirst,
          ),
      ).rejects.toThrow();
    });

    it.skip('should throw an error if organization does not exist', async () => {
      expect(
        async () =>
          await ctr.deleteOrganization(
            faker.string.uuid(),
            ctx.permissions.deleteFirst,
          ),
      ).rejects.toThrow();
    });
  });
});
