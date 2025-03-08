import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { INestApplication } from '@nestjs/common';
import * as dto from '@vidya/api/edu/dto';
import { createTestingApp } from '@vidya/api/utils';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';
import { instanceToPlain } from 'class-transformer';
import * as request from 'supertest';

import { Context, createContext } from './context';

describe('/edu/orgs', () => {
  let app: INestApplication;
  let mapper: Mapper;
  let ctx: Context;

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

  it(`GET /edu/orgs returns 401 for unauthorized users`, () => {
    return request(app.getHttpServer())
      .get(Routes().edu.org.find())
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Positive Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/orgs returns only permitted organizations`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.org.find())
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [ctx.one.org],
            entities.Organization,
            dto.OrganizationSummary,
          ),
        ),
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Negative Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/orgs returns nothing if user do not have permissions`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.org.find())
      .set('Authorization', `Bearer ${ctx.empty.tokens.noPermissions}`)
      .expect(200)
      .expect({ items: [] });
  });
});
