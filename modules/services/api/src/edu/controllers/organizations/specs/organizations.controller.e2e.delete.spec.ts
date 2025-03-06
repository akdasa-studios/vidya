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
  let authTokenForFirstOrg: string;

  /* -------------------------------------------------------------------------- */
  /*                                    Setup                                   */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    app = await createModule();
    ctx = await createContext(app.get(OrganizationsService));
    authService = app.get(AuthService);
    authTokenForFirstOrg = (
      await authService.generateTokens(faker.string.uuid(), [
        { oid: ctx.orgs.first.id, p: ['orgs:delete'] },
      ])
    ).accessToken;
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
      .set('Authorization', `Bearer ${authTokenForFirstOrg}`)
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
      .delete(Routes().edu.org.delete(ctx.orgs.first.id))
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

  it('DELETE /edu/orgs/:id returns 403 for unauthorized user', async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.org.delete(ctx.orgs.second.id))
      .set('Authorization', `Bearer ${authTokenForFirstOrg}`)
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
      .delete(Routes().edu.org.delete(ctx.orgs.first.id))
      .set('Authorization', `Bearer ${authTokenForFirstOrg}`)
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
      .delete(Routes().edu.org.delete(nonExistentId)) // Non-existent ID
      .set('Authorization', `Bearer ${authTokenForFirstOrg}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe(
          `Organization with ID ${nonExistentId} not found`,
        );
      });
  });
});
