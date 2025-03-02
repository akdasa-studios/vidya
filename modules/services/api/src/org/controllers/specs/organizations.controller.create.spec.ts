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
      expect(async () => {
        await ctr.createOrganization(
          { name: faker.company.name() },
          ctx.permissions.no,
        );
      }).rejects.toThrow();
    });

    it.skip('should throw an error if name is not specified', async () => {
      expect(
        async () =>
          await ctr.createOrganization({ name: '' }, ctx.permissions.create),
      ).rejects.toThrow();
    });
  });
});
