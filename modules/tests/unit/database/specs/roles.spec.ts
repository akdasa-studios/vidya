import { Role } from "@vidya/entities";
import { QueryFailedError } from "typeorm";
import { dataSource } from "../helpers/dataSource";

describe('Role', () => {
  test('should create a role', async () => {
    // Arrange
    const role = new Role();
    role.name = 'test role';
    role.description = 'test description';
    role.permissions = ['read', 'write'];

    // Act
    const result = await dataSource.manager.save(role);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.name).toBe('test role');
    expect(result.description).toBe('test description');
    expect(result.permissions).toEqual(['read', 'write']);
  });

  test('should raise error if name is not specified', async () => {
    // Arrange
    const role = new Role();
    role.description = 'test Role';

    // Act
    const save = async () => await dataSource.manager.save(role);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });

  test('should raise error if description is not specified', async () => {
    // Arrange
    const role = new Role();
    role.name = 'test Role';

    // Act
    const save = async () => await dataSource.manager.save(role);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });
});
