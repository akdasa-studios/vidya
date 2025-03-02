import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import * as dto from '@vidya/api/org/dto';
import { OrganizationsService } from '@vidya/api/org/services';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';
import { instanceToPlain } from 'class-transformer';
import * as request from 'supertest';

import { Context, createContext, createModule } from './context';

describe('/orgs', () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */

  let app: INestApplication;
  let authService: AuthService;
  let mapper: Mapper;
  let ctx: Context;

  /* -------------------------------------------------------------------------- */
  /*                                 Before Each                                */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    app = await createModule();
    ctx = await createContext(app.get(OrganizationsService));
    authService = app.get(AuthService);
    mapper = app.get(DEFAULT_MAPPER_TOKEN);
  });

  it(`GET /orgs returns 401 for unauthorized users`, () => {
    return request(app.getHttpServer())
      .get(Routes().org.find())
      .set('Authorization', 'Bearer YOUR_AUTH_TOKEN')
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  it(`GET /orgs returns only permitted organizations`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: ctx.orgs.first.id, p: ['orgs:read'] },
    ]);

    return request(app.getHttpServer())
      .get(Routes().org.find())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [ctx.orgs.first],
            entities.Organization,
            dto.OrganizationSummary,
          ),
        ),
      });
  });

  it(`GET /orgs returns nothing`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: faker.string.uuid(), p: ['orgs:read'] },
    ]);

    return request(app.getHttpServer())
      .get(Routes().org.find())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(200)
      .expect({ items: [] });
  });
  afterAll(async () => {
    await app.close();
  });
});
