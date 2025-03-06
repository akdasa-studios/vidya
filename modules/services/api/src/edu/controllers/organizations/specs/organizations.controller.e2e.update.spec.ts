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
  /*                                   Setup                                    */
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
  /*                              Params Validation                             */
  /* -------------------------------------------------------------------------- */

  it(`PATCH /edu/orgs/:id 400 if id is invalid format`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: ctx.orgs.first.id, p: ['orgs:read'] }, // Missing 'orgs:update' permission
    ]);

    return request(app.getHttpServer())
      .patch(Routes().edu.org.update('invalid-uuid'))
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('Validation failed (uuid is expected)');
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authentication Validation                         */
  /* -------------------------------------------------------------------------- */

  it(`PATCH /edu/orgs/:id returns 401 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.org.update(ctx.orgs.first.id))
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /*                             Payload Validation                             */
  /* -------------------------------------------------------------------------- */

  it.each([
    { payload: { name: '' }, errors: ['name should not be empty'] },
    { payload: { name: '  ' }, errors: ['name should not be empty'] },
    {
      payload: { name: faker.lorem.paragraphs(5) },
      errors: ['name must be shorter than or equal to 128 characters'],
    },
  ])(
    `PATCH /edu/orgs/:id 400 if payload is invalid`,
    async ({ payload, errors }) => {
      const tokens = await authService.generateTokens(faker.string.uuid(), [
        { oid: ctx.orgs.first.id, p: ['orgs:update'] },
      ]);

      return request(app.getHttpServer())
        .patch(Routes().edu.org.update(ctx.orgs.first.id))
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send(payload)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toStrictEqual(errors);
        });
    },
  );

  /* -------------------------------------------------------------------------- */
  /*                               Positive Cases                               */
  /* -------------------------------------------------------------------------- */

  it.each([
    { name: faker.company.name() },
    { name: 'Updated Organization' },
    { name: '#$#$#$%$#%^' },
  ])(
    `PATCH /edu/orgs/:id updates an existing organization`,
    async (payload) => {
      const tokens = await authService.generateTokens(faker.string.uuid(), [
        { oid: ctx.orgs.first.id, p: ['orgs:update'] },
      ]);

      return request(app.getHttpServer())
        .patch(Routes().edu.org.update(ctx.orgs.first.id))
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send(payload)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(payload.name);
        });
    },
  );
});
