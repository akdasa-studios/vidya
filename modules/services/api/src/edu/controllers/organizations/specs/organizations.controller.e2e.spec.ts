import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import * as dto from '@vidya/api/edu/dto';
import { OrganizationsService } from '@vidya/api/edu/services';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';
import { instanceToPlain } from 'class-transformer';
import * as request from 'supertest';

import { Context, createContext, createModule } from './context';

describe('/edu/orgs', () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */

  let app: INestApplication;
  let authService: AuthService;
  let mapper: Mapper;
  let ctx: Context;

  /* -------------------------------------------------------------------------- */
  /*                                 Before Each                                */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    app = await createModule();
    ctx = await createContext(app.get(OrganizationsService));
    authService = app.get(AuthService);
    mapper = app.get(DEFAULT_MAPPER_TOKEN);
  });

  it(`GET /edu/orgs returns 401 for unauthorized users`, () => {
    return request(app.getHttpServer())
      .get(Routes().edu.org.find())
      .set('Authorization', 'Bearer YOUR_AUTH_TOKEN')
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               GET /edu/orgs                                */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/orgs returns only permitted organizations`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: ctx.orgs.first.id, p: ['orgs:read'] },
    ]);

    return request(app.getHttpServer())
      .get(Routes().edu.org.find())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [ctx.orgs.first],
            entities.Organization,
            dto.OrganizationSummary,
          ),
        ),
      });
  });

  it(`GET /edu/orgs returns nothing`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: faker.string.uuid(), p: ['orgs:read'] },
    ]);

    return request(app.getHttpServer())
      .get(Routes().edu.org.find())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(200)
      .expect({ items: [] });
  });

  /* -------------------------------------------------------------------------- */
  /*                               POST /edu/orgs                               */
  /* -------------------------------------------------------------------------- */

  it(`POST /edu/orgs creates a new organization`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: faker.string.uuid(), p: ['orgs:create'] },
    ]);

    const newOrg = { name: 'New Organization' };

    return request(app.getHttpServer())
      .post(Routes().edu.org.create())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(newOrg)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
      });
  });

  it(`POST /edu/orgs returns 400 for invalid data`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: faker.string.uuid(), p: ['orgs:create'] },
    ]);

    const invalidOrg = { name: '' }; // Invalid data

    return request(app.getHttpServer())
      .post(Routes().edu.org.create())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(invalidOrg)
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toEqual(['name should not be empty']);
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                              PATCH /edu/orgs/:id                           */
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

  /* -------------------------------------------------------------------------- */
  /*                            DELETE /edu/orgs/:id                            */
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

  afterAll(async () => {
    await app.close();
  });
});
