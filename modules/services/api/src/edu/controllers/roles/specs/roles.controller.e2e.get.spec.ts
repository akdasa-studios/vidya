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

  it(`GET /edu/roles returns only permitted roles`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${ctx.one.tokens.owner}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [ctx.one.roles.owner, ctx.one.roles.readonly],
            entities.Role,
            dto.RoleSummary,
          ),
        ),
      });
  });

  it(`GET /edu/roles returns only permitted roles (multiple schools)`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${ctx.one.tokens.oneAndTwoAdmin}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [ctx.one.roles.owner, ctx.one.roles.readonly, ctx.two.roles.admin],
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
