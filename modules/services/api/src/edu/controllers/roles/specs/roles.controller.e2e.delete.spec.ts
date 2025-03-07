import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import { OrganizationsService, RolesService } from '@vidya/api/edu/services';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { Context, createContext, createModule } from './context';

describe('/edu/roles', () => {
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
    ctx = await createContext(
      app.get(OrganizationsService),
      app.get(RolesService),
    );
    authService = app.get(AuthService);
    authTokenForFirstOrg = (
      await authService.generateTokens(faker.string.uuid(), [
        { oid: ctx.orgs.first.id, p: ['roles:delete'] },
      ])
    ).accessToken;
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

  it(`DELETE /edu/roles/:id returns 401 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete(ctx.roles.orgOneAdmin.id))
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

  it('DELETE /edu/roles/:id returns 403 for unauthorized user', async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete(ctx.roles.orgTwoAdmin.id))
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

  it(`DELETE /edu/roles/:id deletes an existing role`, async () => {
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete(ctx.roles.orgOneAdmin.id))
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

  it(`DELETE /edu/roles/:id returns 404 for non-existent role`, async () => {
    const nonExistentId = faker.string.uuid();
    return request(app.getHttpServer())
      .delete(Routes().edu.roles.delete(nonExistentId)) // Non-existent ID
      .set('Authorization', `Bearer ${authTokenForFirstOrg}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe(
          `Role with ID ${nonExistentId} not found`,
        );
      });
  });
});
