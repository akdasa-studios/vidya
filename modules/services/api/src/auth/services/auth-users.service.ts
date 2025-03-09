import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dto from '@vidya/api/auth/dto';
import { Role, User } from '@vidya/entities';
import * as entities from '@vidya/entities';
import { UserPermission } from '@vidya/protocol';
import { Repository } from 'typeorm';

export type LoginField = 'email' | 'phone';

@Injectable()
export class AuthUsersService {
  /**
   * Creates an instance of AuthUsersService.
   * @param users Users repository
   * @param roles Rples repository
   * @param mapper Mapper instance
   */
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /**
   * Finds a user by id.
   * @param id Id of the user
   * @returns User with the given id or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return await this.users.findOne({ where: { id }, relations: ['roles'] });
  }

  /**
   * Gets a user by login or creates a new one if not found.
   * @param field Field to search by
   * @param login Login value
   * @returns User with the given login or null if not found
   */
  async getOrCreateByLogin(field: LoginField, login: string): Promise<User> {
    const existingUser = await this.users.findOne({
      where: { [field]: login },
      relations: ['roles'],
    });
    if (existingUser) {
      return existingUser;
    }

    const newUser = this.users.create({
      [field]: login,
      roles: [],
    });
    return await this.users.save(newUser);
  }

  /**
   * Gets roles of a user.
   * @param userId Id of the user
   * @returns Roles of the user
   */
  async getRolesOfUser(userId: string): Promise<Role[]> {
    return await this.roles
      .createQueryBuilder('role')
      .innerJoin('role.userRoles', 'userRole')
      .where('userRole.userId = :userId', { userId })
      .getMany();
  }

  /**
   * Gets user permissions.
   * @param userId User id
   * @returns User permissions
   */
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    const userRoles = await this.getRolesOfUser(userId);
    return this.mapper.mapArray(userRoles, entities.Role, dto.UserPermission);
  }
}
