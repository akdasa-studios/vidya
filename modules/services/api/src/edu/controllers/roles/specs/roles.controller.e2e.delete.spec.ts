import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '@vidya/api/edu/shared';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { Context, createContext } from './context';

describe('/edu/roles', () => {
  let app: INestApplication;
  let ctx: Context;

  beforeEach(async () => {
    app = await createTestingApp();
    ctx = await createContext(app);
  });

  afterAll(async () => {
    await app.close();
  });

  afterAll(async () => {
    await app.close();
  });

  /* -------------------------------------------------------------------------- */
  /*                              Params Validation                             */
  /* -------------------------------------------------------------------------- */

  it(`DELETE /edu/roles/:id 400 if id is invalid format`, async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete('invalid-uuid'))
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('Validation failed (uuid is expected)');
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authentication Validation                         */
  /* -------------------------------------------------------------------------- */

  it(`DELETE /edu/roles/:id returns 401 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete(ctx.one.roles.admin.id))
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

  it('DELETE /edu/roles/:id returns 403 for unauthorized user', async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete(ctx.two.roles.admin.id))
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .expect(403)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('User does not have permission');
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Positive Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`DELETE /edu/roles/:id deletes an existing role`, async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete(ctx.one.roles.admin.id))
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(true);
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Negative Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`DELETE /edu/roles/:id returns 404 for non-existent role`, async () => {
    const nonExistentId = faker.string.uuid();
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete(nonExistentId))
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe(
          `Role with ID ${nonExistentId} not found`,
        );
      });
  });
});
