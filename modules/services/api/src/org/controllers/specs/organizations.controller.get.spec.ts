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
      expect(
        async () =>
          await ctr.getOrganization(ctx.orgs.first.id, ctx.permissions.no),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      expect(async () => {
        return await ctr.getOrganization(
          faker.string.uuid(),
          ctx.permissions.no,
        );
      }).rejects.toThrow();
    });
  });
});
