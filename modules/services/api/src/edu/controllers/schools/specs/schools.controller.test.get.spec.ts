import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { INestApplication } from '@nestjs/common';
import { SchoolsController } from '@vidya/api/edu/controllers';
import * as dto from '@vidya/api/edu/dto';
import { createTestingApp } from '@vidya/api/edu/shared';
import * as entities from '@vidya/entities';

import { Context, createContext } from './context';

describe('SchoolsController', () => {
  let app: INestApplication;
  let ctx: Context;
  let ctr: SchoolsController;
  let mapper: Mapper;

  beforeEach(async () => {
    app = await createTestingApp();
    ctx = await createContext(app);
    ctr = app.get(SchoolsController);
    mapper = app.get(DEFAULT_MAPPER_TOKEN);
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Get One                                  */
  /* -------------------------------------------------------------------------- */

  describe('getOne', () => {
    it('returns school by Id', async () => {
      const res = await ctr.getOne(
        ctx.one.school.id,
        await ctx.authenticate(ctx.one.users.owner),
      );
      expect(res).toEqual(
        mapper.map(ctx.one.school, entities.School, dto.GetSchoolResponse),
      );
    });

    it('throws an error if access is not permitted', async () => {
      await expect(async () => {
        await ctr.getOne(
          ctx.one.school.id,
          await ctx.authenticate(ctx.two.users.admin),
        );
      }).rejects.toThrow(`School with id ${ctx.one.school.id} not found`);
    });

    it('throws an error for user without any permissions', async () => {
      await expect(async () => {
        await ctr.getOne(
          ctx.one.school.id,
          await ctx.authenticate(ctx.misc.users.empty),
        );
      }).rejects.toThrow(`User does not have permission`);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Get Many                                 */
  /* -------------------------------------------------------------------------- */

  describe('getMany', () => {
    it('returns all schools in permitted roles', async () => {
      const res = await ctr.getMany(
        await ctx.authenticate(ctx.one.users.owner),
      );
      expect(res.items).toHaveLength(1);
    });

    it('returns all schools in multiple permitted roles', async () => {
      const res = await ctr.getMany(
        await ctx.authenticate(ctx.misc.users.adminOfOneAndTwo),
      );
      expect(res.items).toHaveLength(2);
      expect(res.items).toEqual([ctx.one.school, ctx.two.school]);
    });
  });
});
