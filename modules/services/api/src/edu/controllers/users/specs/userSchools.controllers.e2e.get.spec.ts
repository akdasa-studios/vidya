import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '@vidya/api/edu/shared';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { Context, createContext } from './context';

describe('/edu/users/:id/schools', () => {
  let app: INestApplication;
  let ctx: Context;

  beforeEach(async () => {
    app = await createTestingApp();
    ctx = await createContext(app);
  });

  afterAll(async () => {
    await app.close();
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authentication Validation                         */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/users/:id/schools returns 401 for unauthenticated user`, () => {
    return request(app.getHttpServer())
      .get(Routes().edu.user(ctx.one.users.oneAdmin.id).schools.all())
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  it(`GET /edu/users/:id/schools returns 403 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.user(ctx.misc.users.empty.id).schools.all())
      .set('Authorization', await ctx.getAuthTokenFor(ctx.misc.users.empty))
      .expect(403)
      .expect({
        message: 'User does not have permission',
        error: 'Forbidden',
        statusCode: 403,
      });
  });

  it(`GET /edu/users/:id/schools returns 403 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.user(ctx.one.users.oneAdmin.id).schools.all())
      .set('Authorization', await ctx.getAuthTokenFor(ctx.two.users.twoAdmin))
      .expect(403)
      .expect({
        message: 'User does not have permission',
        error: 'Forbidden',
        statusCode: 403,
      });
  });
});
