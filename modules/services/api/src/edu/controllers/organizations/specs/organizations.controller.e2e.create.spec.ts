import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import { OrganizationsService } from '@vidya/api/edu/services';
import { Routes } from '@vidya/protocol';
import * as request from 'supertest';

import { createContext, createModule } from './context';

describe('/edu/orgs', () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */

  let app: INestApplication;
  let authService: AuthService;

  /* -------------------------------------------------------------------------- */
  /*                                    Setup                                   */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    app = await createModule();
    await createContext(app.get(OrganizationsService));
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
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
});
