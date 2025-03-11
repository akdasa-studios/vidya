import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { INestApplication } from '@nestjs/common';
import { UserPermissions } from '@vidya/api/auth/utils';
import { UsersController } from '@vidya/api/edu/controllers';
import * as dto from '@vidya/api/edu/dto';
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

  /* -------------------------------------------------------------------------- */
  /*                                   Get Many                                 */
  /* -------------------------------------------------------------------------- */

  describe('getMany', () => {
    it('user can see all users in school', async () => {
      const res = await ctr.getMany(
        new dto.GetUsersQuery(),
        getPermissions([ctx.one.roles.oneAdmin]),
      );
      expectUsers(res, [ctx.one.users.oneAdmin]);
    });

    it('user can see all users in multiple schools', async () => {
      const res = await ctr.getMany(
        new dto.GetUsersQuery(),
        getPermissions([ctx.one.roles.oneAdmin, ctx.two.roles.twoAdmin]),
      );
      expectUsers(res, [ctx.one.users.oneAdmin, ctx.two.users.twoAdmin]);
    });

    it('should filter by schoolId', async () => {
      const res = await ctr.getMany(
        new dto.GetUsersQuery({ schoolId: ctx.one.school.id }),
        getPermissions([ctx.one.roles.oneAdmin, ctx.two.roles.twoAdmin]),
      );
      expectUsers(res, [ctx.one.users.oneAdmin]);
    });
  });
});
