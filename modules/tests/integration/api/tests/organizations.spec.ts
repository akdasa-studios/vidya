import { test, expect } from '@playwright/test';
import { initializeDatabase, destoryDatabase } from 'helpers/dataSource';
import { faker } from '@faker-js/faker';
import { CreateOrganizationRequest, Routes } from '@vidya/protocol';
import { Organization } from '@vidya/entities';

test.describe('Organization', () => {
  const routes = Routes('http://localhost:8001');
  let organization: Organization;
  let dataSource;

  test.beforeEach(async () => {
    dataSource = await initializeDatabase();
    organization = new Organization();
    organization.name = faker.company.name();
    await dataSource.manager.save(organization);
  });

  test.afterEach(async () => {
    await destoryDatabase(dataSource);
  });

  test('it should return an array of organizations', async ({ request }) => {
    const response = await request.get(routes.org.find());
    const data = await response.json();

    // assert
    expect(data).toBeDefined();
    expect(data).toEqual({
      items: [{ id: organization.id, name: organization.name }],
    });
  });

  test('it should return an organization by id', async ({ request }) => {
    const response = await request.get(routes.org.get(organization.id));
    const data = await response.json();

    // assert
    expect(data).toBeDefined();
    expect(data).toEqual({ id: organization.id, name: organization.name });
  });

  test('it should create an organization', async ({ request }) => {
    const createOrgRequest: CreateOrganizationRequest = {
      name: faker.company.name(),
    };

    // act
    const response = await request.post(routes.org.create(), {
      data: createOrgRequest,
    });
    const data = await response.json();

    // assert
    expect(data).toBeDefined();
    expect(data).toEqual({
      id: expect.any(String),
    });
  });

  test('it should update an organization', async ({ request }) => {
    const updatedName = faker.company.name();

    // act
    const response = await request.patch(routes.org.update(organization.id), {
      data: { name: updatedName },
    });
    const data = await response.json();

    // assert
    expect(data).toBeDefined();
    expect(data).toEqual({
      id: organization.id,
      name: updatedName,
    });
  });

  test('it should not update an organization with invalid name', async ({
    request,
  }) => {
    const response = await request.patch(routes.org.update(organization.id), {
      data: { name: '' },
    });

    // assert
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['name should not be empty'],
    });
  });

  test('it should delete an organization', async ({ request }) => {
    // act
    const response = await request.delete(routes.org.delete(organization.id));
    const data = await response.json();

    // assert
    expect(data).toBeDefined();
    expect(data).toEqual({ success: true });
  });
});
