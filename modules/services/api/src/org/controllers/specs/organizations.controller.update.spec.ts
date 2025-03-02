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
  /*                             Update Organization                            */
  /* -------------------------------------------------------------------------- */

  describe('updateOrganization', () => {
    it.skip.each([{ name: '' }])(
      'should throw an error if request is incorrect',
      async (request) => {
        expect(
          async () =>
            await ctr.updateOrganization(
              request,
              ctx.orgs.first.id,
              ctx.permissions.updateFirst,
            ),
        ).rejects.toThrow();
      },
    );

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
      expect(
        async () =>
          await ctr.updateOrganization(
            { name: 'Updated Org 1' },
            faker.string.uuid(),
            ctx.permissions.updateFirst,
          ),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      expect(
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
