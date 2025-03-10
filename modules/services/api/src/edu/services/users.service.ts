import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { Scope, ScopedEntitiesService } from './entities.service';

@Injectable()
export class UsersService extends ScopedEntitiesService<User, Scope> {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, (query, scope) => {
      // HACK: For some reason FindOptionsWhere<User> doesn't
      //       work here, so we have to cast it to any. It doesn't contain
      //       any fields like id, name, etc. But it should.
      const { schoolId } = (query?.where ?? {}) as any;

      // Get all user scopes and filter whem by query params if provided
      // - If organizationId or schoolId are provided, only return users
      //   in those organizations or schools that the user has access to
      // - If not, return all users in organizations and schools the user
      //   has access to
      const userScopes = scope.permissions
        .getScopes(['users:read'])
        .filter((s) => !schoolId || s.schoolId === schoolId);

      // Get all organizations the user has access to. Because users
      // who have access on the school level only should see all users
      //  in the organization (but not other schools)
      const allSchools = userScopes.map((s) => s.schoolId);

      // Create a scoped query for the user
      const scopedQuery = {
        where: [
          // Allow users to see users in organizations
          // and schools they have access to
          ...userScopes.map((s) => ({
            roles: {
              schoolId: s.schoolId,
            },
          })),
          // Allow users to see all users in organizations
          // they have access to
          ...[{ roles: { schoolId: In(allSchools) } }],
        ],
      };
      this.logger.verbose(`Scoped Query: ${JSON.stringify(scopedQuery)}`);
      return scopedQuery;
    });
  }
}
