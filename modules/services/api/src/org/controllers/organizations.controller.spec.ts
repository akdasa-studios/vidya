import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@vidya/api/app.module';
import { inMemoryDataSource } from '@vidya/api/utils';
import { DataSource } from 'typeorm';

import { OrganizationsService } from '../services';
import { OrganizationsController } from './organizations.controller';

describe('OrganizationsController', () => {
  let orgsController: OrganizationsController;
  let orgsService: OrganizationsService;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeEach(async () => {
    dataSource = await inMemoryDataSource();
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    orgsService = module.get(OrganizationsService);
    orgsController = module.get(OrganizationsController);
  });

  describe('getOrganizations', () => {
    it('should return an empty array if no organizations exist', async () => {
      const response = await orgsController.getOrganizations();
      expect(response.items).toEqual([]);
    });

    it('should return organizations', async () => {
      // arrange
      const org1 = await orgsService.create({ name: 'Org 1' });
      const org2 = await orgsService.create({ name: 'Org 2' });

      // act
      const response = await orgsController.getOrganizations();

      // assert
      expect(response.items).toEqual([org1, org2]);
    });
  });

  describe('getOrganization', () => {
    it('should return an organization', async () => {
      // arrange
      const org = await orgsService.create({
        name: faker.company.name(),
      });

      // act
      const response = await orgsController.getOrganization(org.id);

      // assert
      expect(response).toEqual(org);
    });

    it('should throw an error if organization does not exist', async () => {
      expect(async () => {
        console.log('updating invalid org');
        return await orgsController.getOrganization('invalid id');
      }).rejects.toThrow();
    });
  });

  describe('createOrganization', () => {
    it('should create an organization', async () => {
      const request = { name: faker.company.name() };
      const response = await orgsController.createOrganization(request);
      expect(response.id).toBeDefined();
    });

    it.skip('should throw an error if name is not specified', async () => {
      expect(
        async () => await orgsController.createOrganization({ name: '' }),
      ).rejects.toThrow();
    });
  });

  describe('updateOrganization', () => {
    it.skip.each([{ name: '' }])(
      'should throw an error if request is incorrect',
      async (request) => {
        const org = await orgsService.create({ name: faker.company.name() });
        expect(
          async () => await orgsController.updateOrganization(request, org.id),
        ).rejects.toThrow();
      },
    );

    it('should update an organization', async () => {
      // arrange
      const org = await orgsService.create({ name: faker.company.name() });
      const updatedName = faker.company.name() + ' Updated';

      // act
      const response = await orgsController.updateOrganization(
        {
          name: updatedName,
        },
        org.id,
      );

      // assert
      expect(response.name).toEqual(updatedName);
    });

    it('should throw an error if organization does not exist', async () => {
      expect(
        async () =>
          await orgsController.updateOrganization(
            { name: 'Updated Org 1' },
            faker.string.uuid(),
          ),
      ).rejects.toThrow();
    });
  });

  describe('deleteOrganization', () => {
    it('should delete an organization', async () => {
      const org = await orgsService.create({ name: faker.company.name() });
      const response = await orgsController.deleteOrganization(org.id);
      expect(response.success).toBeTruthy();
    });

    it.skip('should throw an error if organization does not exist', async () => {
      expect(
        async () =>
          await orgsController.deleteOrganization(faker.string.uuid()),
      ).rejects.toThrow();
    });
  });
});
