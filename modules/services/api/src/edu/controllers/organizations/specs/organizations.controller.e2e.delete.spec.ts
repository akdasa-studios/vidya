import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import { OrganizationsService } from '@vidya/api/edu/services';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { Context, createContext, createModule } from './context';

describe('/edu/orgs', () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  let app: INestApplication;
  let authService: AuthService;
  let ctx: Context;

  /* -------------------------------------------------------------------------- */
  /*                                    Setup                                   */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    app = await createModule();
    ctx = await createContext(app.get(OrganizationsService));
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  /* -------------------------------------------------------------------------- */
  /*                              DELETE /edu/orgs                              */
  /* -------------------------------------------------------------------------- */

  it(`DELETE /edu/orgs/:id deletes an existing organization`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: ctx.orgs.first.id, p: ['orgs:delete'] },
    ]);

    return request(app.getHttpServer())
      .delete(Routes().edu.org.delete(ctx.orgs.first.id))
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(true);
      });
  });

  it(`DELETE /edu/orgs/:id returns 404 for non-existent organization`, async () => {
    const nonExistentId = faker.string.uuid();
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: faker.string.uuid(), p: ['orgs:delete'] },
    ]);

    return request(app.getHttpServer())
      .delete(Routes().edu.org.delete(nonExistentId)) // Non-existent ID
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe(
          `Organization with ID ${nonExistentId} not found`,
        );
      });
  });
});
