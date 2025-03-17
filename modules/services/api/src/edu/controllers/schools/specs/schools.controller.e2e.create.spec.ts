import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import * as dto from '@vidya/api/edu/dto';
import { createTestingApp } from '@vidya/api/edu/shared';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { Context, createContext } from './context';

describe('/edu/schools', () => {
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

  it(`POST /edu/schools returns 401 for unauthenticated user`, () => {
    return request(app.getHttpServer())
      .get(Routes().edu.schools.create())
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  it(`POST /edu/schools returns 403 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .post(Routes().edu.schools.create())
      .set('Authorization', await ctx.getAuthTokenFor(ctx.one.users.readonly))
      .send(new dto.CreateSchoolRequest({ name: faker.company.name() }))
      .expect(403)
      .expect({
        message: 'User does not have permission',
        error: 'Forbidden',
        statusCode: 403,
      });
  });
});
