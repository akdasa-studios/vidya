import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import { OrganizationsService, RolesService } from '@vidya/api/edu/services';
import * as domain from '@vidya/domain';
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

  /* -------------------------------------------------------------------------- */
  /*                                   Setup                                    */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    app = await createModule();
    ctx = await createContext(
      app.get(OrganizationsService),
      app.get(RolesService),
    );
    authService = app.get(AuthService);
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
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: ctx.orgs.first.id, p: ['roles:read'] }, // Missing 'roles:create' permission
    ]);

    const payload = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['orgs:read', 'orgs:update'],
      organizationId: ctx.orgs.first.id,
    };

    return request(app.getHttpServer())
      .post(Routes().edu.roles.create())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
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
      const tokens = await authService.generateTokens(faker.string.uuid(), [
        { oid: ctx.orgs.first.id, p: ['roles:create'] },
      ]);

      return request(app.getHttpServer())
        .post(Routes().edu.roles.create())
        .set('Authorization', `Bearer ${tokens.accessToken}`)
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
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: ctx.orgs.first.id, p: ['roles:create'] },
    ]);

    const payload = {
      name: 'New Role',
      description: 'Role description',
      permissions: ['orgs:read', 'orgs:update'],
      organizationId: ctx.orgs.first.id,
    };

    request(app.getHttpServer())
      .post(Routes().edu.roles.create())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.id).toBeDefined();
      });
  });
});
