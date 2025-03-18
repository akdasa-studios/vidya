import { faker } from '@faker-js/faker';
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

  it(`PATCH /edu/users/:id/schools returns 401 for unauthenticated user`, () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.user(ctx.one.users.oneAdmin.id).schools.create())
      .send({ schoolId: faker.string.uuid() })
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  it(`PATCH /edu/users/:id/schools returns 403 for unauthorized user`, async () => {
    return (
      request(app.getHttpServer())
        .patch(Routes().edu.user(ctx.one.users.oneAdmin.id).schools.create())
        .set('Authorization', await ctx.getAuthTokenFor(ctx.two.users.twoAdmin))
        .send({ schoolId: ctx.two.school.id })
        // .expect(403)
        .expect({
          message: 'User does not have permission',
          error: 'Forbidden',
          statusCode: 403,
        })
    );
  });
});
