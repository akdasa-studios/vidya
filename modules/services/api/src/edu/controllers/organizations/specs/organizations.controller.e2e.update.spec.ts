import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '@vidya/api/edu/shared';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { Context, createContext } from './context';

describe('/edu/orgs', () => {
  let app: INestApplication;
  let ctx: Context;

  /* -------------------------------------------------------------------------- */
  /*                                   Setup                                    */
  /* -------------------------------------------------------------------------- */

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

  it(`PATCH /edu/orgs/:id 400 if id is invalid format`, async () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.org.update('invalid-uuid'))
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

  it(`PATCH /edu/orgs/:id returns 401 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .patch(Routes().edu.org.update(ctx.one.org.id))
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

  it(`PATCH /edu/orgs/:id returns 403 for missing permissions`, async () => {
    const updatedOrg = { name: 'Updated Organization' };

    return request(app.getHttpServer())
      .patch(Routes().edu.org.update(ctx.one.org.id))
      .set('Authorization', `Bearer ${ctx.one.tokens.readOnly}`)
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
      return request(app.getHttpServer())
        .patch(Routes().edu.org.update(ctx.one.org.id))
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
    { name: 'Updated Organization' },
    { name: '#$#$#$%$#%^' },
  ])(
    `PATCH /edu/orgs/:id updates an existing organization`,
    async (payload) => {
      return request(app.getHttpServer())
        .patch(Routes().edu.org.update(ctx.one.org.id))
        .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
        .send(payload)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(payload.name);
        });
    },
  );
});
