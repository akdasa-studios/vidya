import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { INestApplication } from '@nestjs/common';
import * as dto from '@vidya/api/edu/dto';
import { createTestingApp } from '@vidya/api/edu/shared';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';
import { instanceToPlain } from 'class-transformer';
import * as request from 'supertest';

import { Context, createContext } from './context';

describe('/edu/roles', () => {
  let app: INestApplication;
  let ctx: Context;
  let mapper: Mapper;

  beforeEach(async () => {
    app = await createTestingApp();
    ctx = await createContext(app);
    mapper = app.get(DEFAULT_MAPPER_TOKEN);
  });

  afterAll(async () => {
    await app.close();
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authentication Validation                         */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/roles returns 401 for unauthorized users`, () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Positive Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/roles returns only permitted roles (org level)`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [
              // because user can read roles on org level
              // it can read all roles on school level as well
              ctx.one.roles.admin,
              ctx.one.roles.readonly,
              ctx.one.roles.schoolLevelReadonly,
            ],
            entities.Role,
            dto.RoleSummary,
          ),
        ),
      });
  });

  it(`GET /edu/roles returns only permitted roles (school level)`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${ctx.one.tokens.schoolLevelReadonly}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [
              // because user can read roles on scool
              // level only
              ctx.one.roles.schoolLevelReadonly,
            ],
            entities.Role,
            dto.RoleSummary,
          ),
        ),
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Negative Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/roles returns nothing if user do not have permissions`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${ctx.three.tokens.admin}`)
      .expect(200)
      .expect({ items: [] });
  });

  it(`GET /edu/roles returns nothing if user do not have any permissions`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${ctx.empty.tokens.noPermissions}`)
      .expect(403);
  });
});
