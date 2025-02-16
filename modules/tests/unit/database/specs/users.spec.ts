import { User } from "@vidya/entities";
import { QueryFailedError } from "typeorm";
import { dataSource } from "../helpers/dataSource";

describe('User', () => {
  test('should create a user', async () => {
    // Arrange
    const user = new User();
    user.name = 'test user';
    user.email = 'test@example.com';

    // Act
    const result = await dataSource.manager.save(user);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.name).toBe('test user');
    expect(result.email).toBe('test@example.com');
  });

  test('should raise error for duplicate email', async () => {
    // Arrange
    const user1 = new User();
    user1.name = 'user1';
    user1.email = 'duplicate@example.com';
    await dataSource.manager.save(user1);

    const user2 = new User();
    user2.name = 'user2';
    user2.email = 'duplicate@example.com';

    // Act
    const save = async () => await dataSource.manager.save(user2);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });

  test('should raise error if email and phone are not specified', async () => {
    // Arrange
    const user = new User();
    user.name = 'test user';

    // Act
    const save = async () => await dataSource.manager.save(user);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });
});
