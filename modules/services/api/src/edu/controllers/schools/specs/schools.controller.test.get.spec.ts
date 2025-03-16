import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { INestApplication } from '@nestjs/common';
import { UserPermissions } from '@vidya/api/auth/utils';
import { SchoolsController } from '@vidya/api/edu/controllers';
import * as dto from '@vidya/api/edu/dto';
import { createTestingApp } from '@vidya/api/edu/shared';
import { Role } from '@vidya/entities';
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

  function getPermissions(roles: Role[]): UserPermissions {
    return new UserPermissions(
      roles.map((r) => ({
        sid: r.schoolId,
        p: r.permissions,
      })),
    );
  }

  function expectSchools(
    res: dto.GetSchoolsResponse,
    schools: entities.School[],
  ) {
    expect(res).toHaveProperty('items');
    expect(res.items).toHaveLength(schools.length);
    expect(res.items).toEqual(
      expect.arrayContaining(
        mapper.mapArray(schools, entities.School, dto.SchoolSummary),
      ),
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Get One                                  */
  /* -------------------------------------------------------------------------- */

  describe('getOne', () => {
    it('returns school by Id', async () => {
      const res = await ctr.getOne(
        ctx.one.school.id,
        getPermissions([ctx.one.roles.admin]),
      );
      expect(res).toEqual(
        mapper.map(ctx.one.school, entities.School, dto.GetSchoolResponse),
      );
    });

    it('returns 404 if access is not permitted', async () => {
      await expect(async () => {
        await ctr.getOne(
          ctx.one.school.id,
          getPermissions([ctx.two.roles.admin]),
        );
      }).rejects.toThrow(`School with id ${ctx.one.school.id} not found`);
    });

    it('returns 403 for user without any permissions', async () => {
      await expect(async () => {
        await ctr.getOne(ctx.one.school.id, new UserPermissions([]));
      }).rejects.toThrow(`User does not have permission`);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Get Many                                 */
  /* -------------------------------------------------------------------------- */

  describe('getMany', () => {
    it('returns all schools in permitted roles', async () => {
      const res = await ctr.getMany(getPermissions([ctx.one.roles.admin]));
      expectSchools(res, [ctx.one.school]);
    });

    it('returns all schools in multiple permitted roles', async () => {
      const res = await ctr.getMany(
        getPermissions([ctx.one.roles.admin, ctx.two.roles.admin]),
      );
      expectSchools(res, [ctx.one.school, ctx.two.school]);
    });
  });
});
