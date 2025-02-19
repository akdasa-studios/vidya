import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import { Routes, CreateRoleRequest, CreateRoleResponse } from '@vidya/protocol';
import { Organization } from '@vidya/entities';
import { dataSource } from '../helpers/dataSource';

test.describe('Crud :: Roles', () => {
  const routes = Routes('http://localhost:8001');
  let payload: CreateRoleRequest;

  test.beforeAll(async () => {
    await dataSource.initialize();
    const organization = new Organization();
    organization.name = faker.company.name();
    await dataSource.manager.save(organization);

    payload = {
      name: faker.person.jobTitle(),
      description: faker.lorem.sentence(),
      permissions: ['permission1', 'permission2'],
      organizationId: organization.id,
    };
  });

  /**
   * POST /roles with valid data should create a new role.
   */
  test('should create role', async ({ request }) => {
    // act: create a new role
    const response = await request.post(routes.org.roles.create(), {
      data: payload,
    });

    // assert: new role has been created
    const data = await response.json();
    expect(response.status()).toBe(201);
    expect(data.id).toBeDefined();
  });

  /**
   * POST /roles with invalid data should raise error.
   */
  [
    { field: 'name' },
    { field: 'description' },
    { field: 'permissions' },
  ].forEach((testCase) => {
    test(`should raise error if ${testCase.field} is not specified`, async ({
      request,
    }) => {
      // act
      const response = await request.post(routes.org.roles.create(), {
        data: { ...payload, [testCase.field]: undefined },
      });

      // Assert
      expect(response.status()).toBe(400);
    });
  });

  /**
   * PATCH /roles/:id with valid data should update the role.
   */
  [
    { field: 'name', value: 'updated role' },
    { field: 'description', value: 'updated description' },
    { field: 'permissions', value: ['permission3', 'permission4'] },
  ].forEach((testCase) => {
    test(`should update ${testCase.field} field for role`, async ({
      request,
    }) => {
      // arrange: create a new role
      const createResponse = await request.post(routes.org.roles.create(), {
        data: payload,
      });
      const createData: CreateRoleResponse = await createResponse.json();

      // act: update the role
      const response = await request.patch(
        routes.org.roles.update(createData.id),
        {
          data: { [testCase.field]: testCase.value },
        },
      );

      // assert: role has been updated
      expect(response.status()).toBe(200);
      // TODO: request requies authentication
      // const r = await request.get(routes.org.roles.get(createData.id));
      // expect(await r.json()).toEqual({
      //   ...payload,
      //   id: createData.id,
      //   [testCase.field]: testCase.value,
      // });
    });
  });
});
