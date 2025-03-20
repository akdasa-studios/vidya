import { faker } from '@faker-js/faker';
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

  it(`PATCH /edu/schools/:id/config returns 401 for unauthenticated user`, () => {
    return request(app.getHttpServer())
      .get(Routes().edu.schools.configs.getAll(ctx.one.school.id))
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  it(`PATCH /edu/schools/:id/config returns 403 for unauthorized user`, async () => {
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

  it(`PATCH /edu/schools/:id/config updates the school config`, async () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.schools.configs.getAll(ctx.one.school.id))
      .set('Authorization', await ctx.getAuthTokenFor(ctx.one.users.owner))
      .send({
        defaultStudentRoleId: ctx.one.roles.empty.id,
      })
      .expect(200)
      .expect({ success: true });
  });

  it(`PATCH /edu/schools/:id/config returns 400 if set Owner role`, async () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.schools.configs.getAll(ctx.one.school.id))
      .set('Authorization', await ctx.getAuthTokenFor(ctx.one.users.owner))
      .send({
        defaultStudentRoleId: ctx.one.roles.owner.id,
      })
      .expect(400)
      .expect({
        message: 'Cannot assign owner role',
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it(`PATCH /edu/schools/:id/config returns 400 if set role from another school`, async () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.schools.configs.getAll(ctx.one.school.id))
      .set('Authorization', await ctx.getAuthTokenFor(ctx.one.users.owner))
      .send({
        defaultStudentRoleId: ctx.two.roles.admin.id,
      })
      .expect(400)
      .expect({
        message: 'Role does not belong to this school',
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it(`PATCH /edu/schools/:id/config returns 400 if role doesn't exist`, async () => {
    const roleId = faker.string.uuid();
    return request(app.getHttpServer())
      .patch(Routes().edu.schools.configs.getAll(ctx.one.school.id))
      .set('Authorization', await ctx.getAuthTokenFor(ctx.one.users.owner))
      .send({
        defaultStudentRoleId: roleId,
      })
      .expect(400)
      .expect({
        message: [`Role '${roleId}' not found for 'defaultStudentRoleId'`],
        error: 'Bad Request',
        statusCode: 400,
      });
  });
});
