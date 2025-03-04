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
  /*                                    Seup                                    */
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
  /*                               PATCH /edu/orgs                              */
  /* -------------------------------------------------------------------------- */

  it(`PATCH /edu/orgs/:id updates an existing organization`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: ctx.orgs.first.id, p: ['orgs:update'] },
    ]);

    const updatedOrg = { name: 'Updated Organization' };

    return request(app.getHttpServer())
      .patch(Routes().edu.org.update(ctx.orgs.first.id))
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(updatedOrg)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(updatedOrg.name);
      });
  });

  it(`PATCH /edu/orgs/:id returns 403 for missing permissions`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: ctx.orgs.first.id, p: ['orgs:read'] }, // Missing 'orgs:update' permission
    ]);

    const updatedOrg = { name: 'Updated Organization' };

    return request(app.getHttpServer())
      .patch(Routes().edu.org.update(ctx.orgs.first.id))
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(updatedOrg)
      .expect(403)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('User does not have permission');
      });
  });
});
