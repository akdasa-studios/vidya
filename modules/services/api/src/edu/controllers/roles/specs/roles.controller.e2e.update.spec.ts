import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '@vidya/api/edu/shared';
import * as domain from '@vidya/domain';
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

  /* -------------------------------------------------------------------------- */
  /*                              Params Validation                             */
  /* -------------------------------------------------------------------------- */

  it(`PATCH /edu/roles/:id 400 if id is invalid format`, async () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.roles.update('invalid-uuid'))
      .set('Authorization', `Bearer ${ctx.one.tokens.readOnly}`)
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('Validation failed (uuid is expected)');
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authentication Validation                         */
  /* -------------------------------------------------------------------------- */

  it(`PATCH /edu/roles/:id returns 401 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.roles.update(ctx.one.roles.admin.id))
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

  it(`PATCH /edu/roles/:id returns 403 for missing permissions`, async () => {
    const updatedRole = { name: 'Updated Role' };

    return request(app.getHttpServer())
      .patch(Routes().edu.roles.update(ctx.one.roles.admin.id))
      .set('Authorization', `Bearer ${ctx.one.tokens.readOnly}`)
      .send(updatedRole)
      .expect(403)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('User does not have permission');
      });
  });

  it(`PATCH /edu/roles/:id returns 403 if user has no access to org level role`, async () => {
    const updatedRole = { name: 'Updated Role' };

    return request(app.getHttpServer())
      .patch(Routes().edu.roles.update(ctx.one.roles.admin.id))
      .set('Authorization', `Bearer ${ctx.one.tokens.schoolLevelAdmin}`)
      .send(updatedRole)
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
    // Name:
    { payload: { name: '' }, errors: ['name should not be empty'] },
    { payload: { name: '  ' }, errors: ['name should not be empty'] },
    {
      payload: { name: faker.lorem.paragraphs(5) },
      errors: ['name must be shorter than or equal to 32 characters'],
    },
    // Description
    {
      payload: { description: '' },
      errors: ['description should not be empty'],
    },
    {
      payload: { description: '  ' },
      errors: ['description should not be empty'],
    },
    {
      payload: { description: faker.lorem.paragraphs(5) },
      errors: ['description must be shorter than or equal to 256 characters'],
    },
    // Permissions
    {
      payload: { permissions: ['invalid'] },
      errors: [
        'each value in permissions must be one of the following values: ' +
          domain.PermissionKeys.join(', '),
      ],
    },
  ])(
    `PATCH /edu/roles/:id 400 if payload is invalid`,
    async ({ payload, errors }) => {
      return request(app.getHttpServer())
        .patch(Routes().edu.roles.update(ctx.one.roles.admin.id))
        .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
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
    { name: 'Updated Role' },
    { name: '#$#$#$%$#%^' },
  ])(`PATCH /edu/roles/:id updates an existing role`, async (payload) => {
    return request(app.getHttpServer())
      .patch(Routes().edu.roles.update(ctx.one.roles.admin.id))
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .send(payload)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(payload.name);
      });
  });
});
