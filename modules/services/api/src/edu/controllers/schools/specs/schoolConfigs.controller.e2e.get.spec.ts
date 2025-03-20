import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '@vidya/api/edu/shared';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { Context, createContext } from './context';

describe('/edu/schools/:id/config', () => {
  let app: INestApplication;
  let ctx: Context;

  beforeEach(async () => {
    app = await createTestingApp();
    ctx = await createContext(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`GET /edu/schools/:id/config returns 401 for unauthenticated user`, () => {
    return request(app.getHttpServer())
      .get(Routes().edu.schools.configs.getAll(ctx.one.school.id))
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  it(`GET /edu/schools/:id/config returns 403 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.schools.configs.getAll(ctx.one.school.id))
      .set('Authorization', await ctx.getAuthTokenFor(ctx.one.users.empty))
      .expect(403)
      .expect({
        message: 'User does not have permission',
        error: 'Forbidden',
        statusCode: 403,
      });
  });

  it(`GET /edu/schools/:id/config returns the school config`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.schools.configs.getAll(ctx.one.school.id))
      .set('Authorization', await ctx.getAuthTokenFor(ctx.one.users.owner))
      .expect(200)
      .expect((res) => {
        expect(res.body.defaultStudentRoleId).toBeDefined();
      });
  });
});
