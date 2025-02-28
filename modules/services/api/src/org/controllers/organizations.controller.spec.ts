import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@vidya/api/app.module';
import { UserPermissions } from '@vidya/api/auth/utils';
import { inMemoryDataSource } from '@vidya/api/utils';
import {
  Permision,
  PermissionActions,
  PermissionResources,
} from '@vidya/domain';
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
      const userPermissions = new UserPermissions([]);
      const response = await orgsController.getOrganizations(userPermissions);
      expect(response.items).toEqual([]);
    });

    it('should return organizations all permitted orgs', async () => {
      // arrange
      await orgsService.create({ name: 'Org Not Allowed' });
      const org1 = await orgsService.create({ name: 'Org 1' });
      const org2 = await orgsService.create({ name: 'Org 2' });

      // act
      const userPermissions = new UserPermissions([
        {
          oid: org1.id,
          p: [
            Permision(PermissionResources.Organization, PermissionActions.Read),
          ],
        },
        {
          oid: org2.id,
          p: [
            Permision(PermissionResources.Organization, PermissionActions.Read),
          ],
        },
      ]);
      const response = await orgsController.getOrganizations(userPermissions);

      // assert
      expect(response.items).toEqual([org1, org2]);
    });
  });

  describe('getOrganization', () => {
    it('should return an organization if user permited to do so', async () => {
      // arrange
      const org = await orgsService.create({
        name: faker.company.name(),
      });

      // act
      const userPermissions = new UserPermissions([
        {
          oid: org.id,
          p: [
            Permision(PermissionResources.Organization, PermissionActions.Read),
          ],
        },
      ]);
      const response = await orgsController.getOrganization(
        org.id,
        userPermissions,
      );

      // assert
      expect(response).toEqual(org);
    });

    it('should return 404 if user is not perrmited', async () => {
      // arrange
      const org = await orgsService.create({
        name: faker.company.name(),
      });

      // act
      const userPermissions = new UserPermissions([]);
      expect(
        async () =>
          await orgsController.getOrganization(org.id, userPermissions),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      const userPermissions = new UserPermissions([
        {
          oid: faker.string.uuid(),
          p: [
            Permision(PermissionResources.Organization, PermissionActions.Read),
          ],
        },
      ]);

      expect(async () => {
        console.log('updating invalid org');
        return await orgsController.getOrganization(
          faker.string.uuid(),
          userPermissions,
        );
      }).rejects.toThrow();
    });
  });

  describe('createOrganization', () => {
    it('should create an organization', async () => {
      const request = { name: faker.company.name() };
      const userPermissions = new UserPermissions([
        {
          p: [
            Permision(
              PermissionResources.Organization,
              PermissionActions.Create,
            ),
          ],
        },
      ]);
      const response = await orgsController.createOrganization(
        request,
        userPermissions,
      );
      expect(response.id).toBeDefined();
    });

    it('should throw an error if user does not have permissions', async () => {
      const request = { name: faker.company.name() };
      const userPermissions = new UserPermissions([]);
      expect(async () => {
        await orgsController.createOrganization(request, userPermissions);
      }).rejects.toThrow();
    });

    it.skip('should throw an error if name is not specified', async () => {
      const userPermissions = new UserPermissions([
        {
          p: [
            Permision(
              PermissionResources.Organization,
              PermissionActions.Create,
            ),
          ],
        },
      ]);
      expect(
        async () =>
          await orgsController.createOrganization(
            {
              name: '',
            },
            userPermissions,
          ),
      ).rejects.toThrow();
    });
  });

  describe('updateOrganization', () => {
    it.skip.each([{ name: '' }])(
      'should throw an error if request is incorrect',
      async (request) => {
        const org = await orgsService.create({ name: faker.company.name() });
        const userPermissions = new UserPermissions([
          {
            oid: org.id,
            p: [
              Permision(
                PermissionResources.Organization,
                PermissionActions.Update,
              ),
            ],
          },
        ]);
        expect(
          async () =>
            await orgsController.updateOrganization(
              request,
              org.id,
              userPermissions,
            ),
        ).rejects.toThrow();
      },
    );

    it('should update an organization', async () => {
      // arrange
      const org = await orgsService.create({ name: faker.company.name() });
      const updatedName = faker.company.name() + ' Updated';

      // act
      const userPermissions = new UserPermissions([
        {
          oid: org.id,
          p: [
            Permision(
              PermissionResources.Organization,
              PermissionActions.Update,
            ),
          ],
        },
      ]);
      const response = await orgsController.updateOrganization(
        {
          name: updatedName,
        },
        org.id,
        userPermissions,
      );

      // assert
      expect(response.name).toEqual(updatedName);
    });

    it('should throw an error if organization does not exist', async () => {
      const userPermissions = new UserPermissions([]);
      expect(
        async () =>
          await orgsController.updateOrganization(
            { name: 'Updated Org 1' },
            faker.string.uuid(),
            userPermissions,
          ),
      ).rejects.toThrow();
    });

    it('should throw an error if organization does not exist', async () => {
      // arrange
      const org = await orgsService.create({ name: faker.company.name() });

      // act
      const userPermissions = new UserPermissions([
        {
          oid: faker.string.uuid(),
          p: [
            Permision(
              PermissionResources.Organization,
              PermissionActions.Update,
            ),
          ],
        },
      ]);
      expect(
        async () =>
          await orgsController.updateOrganization(
            { name: 'Updated Org 1' },
            org.id,
            userPermissions,
          ),
      ).rejects.toThrow();
    });
  });

  describe('deleteOrganization', () => {
    it('should delete an organization', async () => {
      const org = await orgsService.create({ name: faker.company.name() });

      // act
      const userPermissions = new UserPermissions([
        {
          oid: org.id,
          p: [
            Permision(
              PermissionResources.Organization,
              PermissionActions.Delete,
            ),
          ],
        },
      ]);
      const response = await orgsController.deleteOrganization(
        org.id,
        userPermissions,
      );
      expect(response.success).toBeTruthy();
    });

    it('should throw an error if user does not have permissions', async () => {
      const org = await orgsService.create({ name: faker.company.name() });
      const userPermissions = new UserPermissions([
        {
          oid: faker.string.uuid(),
          p: [
            Permision(
              PermissionResources.Organization,
              PermissionActions.Delete,
            ),
          ],
        },
      ]);
      expect(
        async () =>
          await orgsController.deleteOrganization(org.id, userPermissions),
      ).rejects.toThrow();
    });

    it.skip('should throw an error if organization does not exist', async () => {
      const userPermissions = new UserPermissions([]);
      expect(
        async () =>
          await orgsController.deleteOrganization(
            faker.string.uuid(),
            userPermissions,
          ),
      ).rejects.toThrow();
    });
  });
});
