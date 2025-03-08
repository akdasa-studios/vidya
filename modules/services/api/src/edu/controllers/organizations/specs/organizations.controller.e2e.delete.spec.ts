import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '@vidya/api/utils';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { Context, createContext } from './context';

describe('/edu/orgs', () => {
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
  /*                              Params Validation                             */
  /* -------------------------------------------------------------------------- */

  it(`DELETE /edu/orgs/:id 400 if id is invalid format`, async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.org.delete('invalid-uuid'))
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

  it(`DELETE /edu/orgs/:id returns 401 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.org.delete(ctx.one.org.id))
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

  it('DELETE /edu/orgs/:id returns 403 for unauthorized user', async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.org.delete(ctx.two.org.id))
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

  it(`DELETE /edu/orgs/:id deletes an existing organization`, async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.org.delete(ctx.one.org.id))
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

  it(`DELETE /edu/orgs/:id returns 404 for non-existent organization`, async () => {
    const nonExistentId = faker.string.uuid();
    return request(app.getHttpServer())
      .delete(Routes().edu.org.delete(nonExistentId))
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe(
          `Organization with ID ${nonExistentId} not found`,
        );
      });
  });
});
