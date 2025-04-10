import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { INestApplication } from '@nestjs/common';
import { UsersController } from '@vidya/api/edu/controllers';
import * as dto from '@vidya/api/edu/dto';
import { UsersService } from '@vidya/api/edu/services';
import { createTestingApp } from '@vidya/api/edu/shared';
import * as entities from '@vidya/entities';

import { Context, createContext } from './context';

describe('UsersController', () => {
  let app: INestApplication;
  let ctx: Context;
  let ctr: UsersController;
  let mapper: Mapper;

  beforeEach(async () => {
    app = await createTestingApp();
    ctx = await createContext(app);
    ctr = app.get(UsersController);
    mapper = app.get(DEFAULT_MAPPER_TOKEN);
  });

  /* -------------------------------------------------------------------------- */
  /*                                 Update One                                 */
  /* -------------------------------------------------------------------------- */

  describe('updateOne', () => {
    it('updates user by Id', async () => {
      const res = await ctr.updateOne(
        new dto.UpdateUserRequest({ name: 'Updated Name' }),
        ctx.one.users.oneAdmin.id,
        await ctx.authenticate(ctx.one.users.oneAdmin),
      );

      expect(res).toEqual(
        mapper.map(
          await app
            .get(UsersService)
            .findOneBy({ id: ctx.one.users.oneAdmin.id }),
          entities.User,
          dto.UpdateUserResponse,
        ),
      );
    });

    it('throws if user do not have permission', async () => {
      await expect(async () => {
        await ctr.updateOne(
          new dto.UpdateUserRequest({ name: 'Updated Name' }),
          ctx.one.users.oneAdmin.id,
          await ctx.authenticate(ctx.two.users.twoAdmin),
        );
      }).rejects.toThrow(`User does not have permission`);
    });
  });
});
