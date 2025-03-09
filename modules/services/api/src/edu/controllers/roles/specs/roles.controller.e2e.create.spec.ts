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
  /*                          Authentication Validation                         */
  /* -------------------------------------------------------------------------- */

  it(`POST /edu/roles returns 401 for unauthorized user`, async () => {
    return request(app.getHttpServer())
      .post(Routes().edu.roles.create())
      .send({})
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

  it(`POST /edu/roles returns 403 for missing permissions`, async () => {
    const payload = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['orgs:read', 'orgs:update'],
      organizationId: ctx.one.org.id,
    };

    return request(app.getHttpServer())
      .post(Routes().edu.roles.create())
      .set('Authorization', `Bearer ${ctx.one.tokens.readOnly}`)
      .send(payload)
      .expect(403)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('User does not have permission');
      });
  });

  it(`POST /edu/roles returns 403 for unauthorized organization`, async () => {
    const payload = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['orgs:read', 'orgs:update'],
      organizationId: ctx.one.org.id,
    };

    return request(app.getHttpServer())
      .post(Routes().edu.roles.create())
      .set('Authorization', `Bearer ${ctx.two.tokens.admin}`)
      .send(payload)
      .expect(403)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('User does not have permission');
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                              Payload Validation                            */
  /* -------------------------------------------------------------------------- */

  it.each([
    // Missing everything.
    {
      payload: {},
      errors: [
        'name must be shorter than or equal to 32 characters',
        'name must be longer than or equal to 1 characters',
        'name should not be empty',
        'name must be a string',
        'description must be shorter than or equal to 128 characters',
        'description should not be empty',
        'description must be a string',
        'each value in permissions must be one of the following values: ' +
          domain.PermissionKeys.join(', '),
        'each value in permissions must be a string',
        'organizationId must be a UUID',
      ],
    },
    // Missing organizationId.
    // Role must be associated with an organization
    {
      payload: {
        name: 'New Role',
        description: 'Role description',
        permissions: ['orgs:read', 'orgs:update'],
      },
      errors: ['organizationId must be a UUID'],
    },
  ])(
    `POST /edu/roles 400 if payload is invalid`,
    async ({ payload, errors }) => {
      return request(app.getHttpServer())
        .post(Routes().edu.roles.create())
        .set('Authorization', `Bearer ${ctx.two.tokens.admin}`)
        .send(payload)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toEqual(errors);
        });
    },
  );

  /* -------------------------------------------------------------------------- */
  /*                               Positive Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`POST /edu/roles creates a new role`, async () => {
    const payload = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['orgs:read', 'orgs:update'],
      organizationId: ctx.one.org.id,
    };

    request(app.getHttpServer())
      .post(Routes().edu.roles.create())
      .set('Authorization', `Bearer ${ctx.one.tokens.admin}`)
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.id).toBeDefined();
      });
  });
});
