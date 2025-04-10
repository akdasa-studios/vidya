import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '@vidya/api/edu/shared';
import * as domain from '@vidya/domain';
import * as protocol from '@vidya/protocol';
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
      .post(protocol.Routes().edu.roles.create())
      .send({})
      .expect(401);
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authorization Validation                          */
  /* -------------------------------------------------------------------------- */

  it(`POST /edu/roles returns 403 for missing permissions`, async () => {
    const payload: protocol.CreateRoleRequest = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['schools:read', 'schools:update'],
      schoolId: ctx.one.school.id,
    };

    return request(app.getHttpServer())
      .post(protocol.Routes().edu.roles.create())
      .set('Authorization', `Bearer ${ctx.one.tokens.readOnly}`)
      .send(payload)
      .expect(403)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('User does not have permission');
      });
  });

  it(`POST /edu/roles returns 403 for unauthorized school`, async () => {
    const payload: protocol.CreateRoleRequest = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['schools:read', 'schools:update'],
      schoolId: ctx.one.school.id,
    };

    return request(app.getHttpServer())
      .post(protocol.Routes().edu.roles.create())
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
        'schoolId must be a UUID',
      ],
    },
    // Missing schoolId.
    // Role must be associated with an school.
    {
      payload: {
        name: 'New Role',
        description: 'Role description',
        permissions: ['schools:read', 'schools:update'],
      },
      errors: ['schoolId must be a UUID'],
    },
  ])(
    `POST /edu/roles 400 if payload is invalid`,
    async ({ payload, errors }) => {
      return request(app.getHttpServer())
        .post(protocol.Routes().edu.roles.create())
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
    const payload: protocol.CreateRoleRequest = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['roles:read', 'roles:update'],
      schoolId: ctx.one.school.id,
    };

    request(app.getHttpServer())
      .post(protocol.Routes().edu.roles.create())
      .set('Authorization', `Bearer ${ctx.one.tokens.owner}`)
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.id).toBeDefined();
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Negative Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`POST /edu/roles returns 400 if permissions contain *`, async () => {
    const payload: protocol.CreateRoleRequest = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['*'],
      schoolId: ctx.one.school.id,
    };

    return request(app.getHttpServer())
      .post(protocol.Routes().edu.roles.create())
      .set('Authorization', `Bearer ${ctx.one.tokens.owner}`)
      .send(payload)
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toStrictEqual([
          'permissions cannot contain *',
        ]);
      });
  });
});
