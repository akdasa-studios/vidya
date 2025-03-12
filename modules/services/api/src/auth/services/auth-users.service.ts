import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as dto from '@vidya/api/auth/dto';
import { AuthConfig, RedisConfig } from '@vidya/api/configs';
import { Role, User } from '@vidya/entities';
import * as entities from '@vidya/entities';
import { UserPermission, UserPermissionsStorageKey } from '@vidya/protocol';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

export type LoginField = 'email' | 'phone';

@Injectable()
export class AuthUsersService {
  private readonly redis: Redis;
  private readonly logger = new Logger(AuthUsersService.name);

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
    @Inject(RedisConfig.KEY)
    private readonly redisConfig: ConfigType<typeof RedisConfig>,
    @Inject(AuthConfig.KEY)
    private readonly authConfig: ConfigType<typeof AuthConfig>,
  ) {
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
    });
  }

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
    // Get permissions from cache if available
    const permissions = await this.redis.get(UserPermissionsStorageKey(userId));

    if (permissions) {
      // Permissions are cached. Parse and return them.
      return JSON.parse(permissions);
    } else {
      this.logger.debug(`Fetching '${userId}' permissions from DB`);

      // Permissions are not cached. Fetch them from the database.
      const userRoles = await this.getRolesOfUser(userId);
      const permissions = this.mapper.mapArray(
        userRoles,
        entities.Role,
        dto.UserPermission,
      );

      // Cache the permissions if cache TTL is set to a positive value
      // otherwise, users permissions will be fetched from the database
      // on every request (which is good for development only)
      if (this.authConfig.userPermissionsCacheTtl > 0) {
        await this.redis.set(
          UserPermissionsStorageKey(userId),
          JSON.stringify(permissions),
          'EX',
          this.authConfig.userPermissionsCacheTtl,
        );
      }

      // Return the permissions
      return permissions;
    }
  }
}
