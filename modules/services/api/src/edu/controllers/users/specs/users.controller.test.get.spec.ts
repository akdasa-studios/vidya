import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { INestApplication } from '@nestjs/common';
import { UserPermissions } from '@vidya/api/auth/utils';
import { UsersController } from '@vidya/api/edu/controllers';
import * as dto from '@vidya/api/edu/dto';
import { UsersService } from '@vidya/api/edu/services';
import { createTestingApp } from '@vidya/api/edu/shared';
import { Role } from '@vidya/entities';
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

  function getPermissions(roles: Role[]): UserPermissions {
    return new UserPermissions(
      roles.map((r) => ({
        sid: r.schoolId,
        p: r.permissions,
      })),
    );
  }

  function expectUsers(res: dto.GetUsersResponse, users: entities.User[]) {
    expect(res).toHaveProperty('items');
    expect(res.items).toHaveLength(users.length);
    expect(res.items).toEqual(
      expect.arrayContaining(
        mapper.mapArray(users, entities.User, dto.UserSummary),
      ),
    );
  }

  describe('getOne', () => {
    it('returns user by Id', async () => {
      const res = await ctr.getOne(
        ctx.one.users.oneAdmin.id,
        getPermissions([ctx.one.roles.oneAdmin]),
      );
      expect(res).toEqual(
        mapper.map(ctx.one.users.oneAdmin, entities.User, dto.GetUserResponse),
      );
    });

    it('returns 404 if access is not permitted', async () => {
      await expect(async () => {
        await ctr.getOne(
          ctx.one.users.oneAdmin.id,
          getPermissions([ctx.two.roles.twoAdmin]),
        );
      }).rejects.toThrow(`User with id ${ctx.one.users.oneAdmin.id} not found`);
    });

    it('returns 403 for user without any permissions', async () => {
      await expect(async () => {
        await ctr.getOne(ctx.one.users.oneAdmin.id, new UserPermissions([]));
      }).rejects.toThrow(`User does not have permission`);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Get Many                                 */
  /* -------------------------------------------------------------------------- */

  describe('getMany', () => {
    it('returns all users in permitted school', async () => {
      const res = await ctr.getMany(
        new dto.GetUsersQuery(),
        getPermissions([ctx.one.roles.oneAdmin]),
      );
      expectUsers(res, [ctx.one.users.oneAdmin]);
    });

    it('returns all users in multiple permitted schools', async () => {
      const res = await ctr.getMany(
        new dto.GetUsersQuery(),
        getPermissions([ctx.one.roles.oneAdmin, ctx.two.roles.twoAdmin]),
      );
      expectUsers(res, [ctx.one.users.oneAdmin, ctx.two.users.twoAdmin]);
    });

    it('filters by schoolId', async () => {
      const res = await ctr.getMany(
        new dto.GetUsersQuery({ schoolId: ctx.one.school.id }),
        getPermissions([ctx.one.roles.oneAdmin, ctx.two.roles.twoAdmin]),
      );
      expectUsers(res, [ctx.one.users.oneAdmin]);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                 Update One                                 */
  /* -------------------------------------------------------------------------- */

  describe('updateOne', () => {
    it('updates user by Id', async () => {
      const res = await ctr.updateOne(
        new dto.UpdateUserRequest({ name: 'Updated Name' }),
        ctx.one.users.oneAdmin.id,
        getPermissions([ctx.one.roles.oneAdmin]),
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
          getPermissions([ctx.two.roles.twoAdmin]),
        );
      }).rejects.toThrow(`User does not have permission`);
    });
  });
});
