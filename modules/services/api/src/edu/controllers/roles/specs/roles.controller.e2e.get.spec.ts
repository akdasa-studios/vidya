import { Mapper } from '@automapper/core';
import { DEFAULT_MAPPER_TOKEN } from '@automapper/nestjs';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@vidya/api/auth/services';
import * as dto from '@vidya/api/edu/dto';
import {
  OrganizationsService,
  RolesService,
  SchoolsService,
} from '@vidya/api/edu/services';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';
import { instanceToPlain } from 'class-transformer';
import * as request from 'supertest';

import { Context, createContext, createModule } from './context';

describe('/edu/roles', () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */

  let app: INestApplication;
  let authService: AuthService;
  let mapper: Mapper;
  let ctx: Context;
  let authTokenForFirstOrg: string;
  let authTokenForSchoolOne: string;

  /* -------------------------------------------------------------------------- */
  /*                                    Setup                                   */
  /* -------------------------------------------------------------------------- */

  beforeEach(async () => {
    app = await createModule();
    ctx = await createContext(
      app.get(OrganizationsService),
      app.get(SchoolsService),
      app.get(RolesService),
    );
    authService = app.get(AuthService);
    mapper = app.get(DEFAULT_MAPPER_TOKEN);
    authTokenForFirstOrg = (
      await authService.generateTokens(faker.string.uuid(), [
        { oid: ctx.orgs.first.id, p: ['roles:read'] },
      ])
    ).accessToken;
    authTokenForSchoolOne = (
      await authService.generateTokens(faker.string.uuid(), [
        { oid: ctx.orgs.first.id, sid: ctx.schools.one.id, p: ['roles:read'] },
      ])
    ).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  /* -------------------------------------------------------------------------- */
  /*                          Authentication Validation                         */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/roles returns 401 for unauthorized users`, () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .expect(401)
      .expect({
        message: 'Unauthorized',
        statusCode: 401,
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Positive Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/roles returns only permitted roles (org level)`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${authTokenForFirstOrg}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [
              // because user can read roles on org level
              // it can read all roles on scool level as well
              ctx.roles.orgOneAdmin,
              ctx.roles.orgOneScoolOneAdmin,
            ],
            entities.Role,
            dto.RoleSummary,
          ),
        ),
      });
  });

  it(`GET /edu/roles returns only permitted roles (school level)`, async () => {
    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${authTokenForSchoolOne}`)
      .expect(200)
      .expect({
        items: instanceToPlain(
          mapper.mapArray(
            [
              // because user can read roles on scool
              // level only
              ctx.roles.orgOneScoolOneAdmin,
            ],
            entities.Role,
            dto.RoleSummary,
          ),
        ),
      });
  });

  /* -------------------------------------------------------------------------- */
  /*                               Negative Cases                               */
  /* -------------------------------------------------------------------------- */

  it(`GET /edu/roles returns nothing if user do not have permissions`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), [
      { oid: faker.string.uuid(), p: ['roles:read'] },
    ]);

    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(200)
      .expect({ items: [] });
  });

  it(`GET /edu/roles returns nothing if user do not have any permissions`, async () => {
    const tokens = await authService.generateTokens(faker.string.uuid(), []);

    return request(app.getHttpServer())
      .get(Routes().edu.roles.find())
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(200)
      .expect({ items: [] });
  });
});
