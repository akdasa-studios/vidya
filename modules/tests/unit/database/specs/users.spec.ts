import { User } from "@vidya/entities";
import { QueryFailedError } from "typeorm";
import { faker } from '@faker-js/faker';
import { dataSource } from "../helpers/dataSource";

describe('User', () => {
  test('should create a user', async () => {
    // Arrange
    const user = new User();
    user.name = faker.person.fullName();
    user.email = faker.internet.exampleEmail();

    // Act
    const result = await dataSource.manager.save(user);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.name).toBe(user.name);
    expect(result.email).toBe(user.email);
  });

  test('should raise error for duplicate email', async () => {
    const email = faker.internet.exampleEmail();
    
    // Arrange
    const user1 = new User();
    user1.name = faker.person.fullName();
    user1.email = email.toLowerCase();
    await dataSource.manager.save(user1);

    const user2 = new User();
    user2.name = faker.person.fullName();
    user2.email = email.toUpperCase();

    // Act
    const save = async () => await dataSource.manager.save(user2);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });

  test('should raise error if email and phone are not specified', async () => {
    // Arrange
    const user = new User();
    user.name = faker.person.fullName();

    // Act
    const save = async () => await dataSource.manager.save(user);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });
});
