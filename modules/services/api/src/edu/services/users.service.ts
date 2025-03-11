import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@vidya/entities';
import { Repository } from 'typeorm';

import { Scope, ScopedEntitiesService } from './entities.service';

@Injectable()
export class UsersService extends ScopedEntitiesService<User, Scope> {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, (query, scope) => {
      // TODO add support for query.where as array
      const {
        roles: { schoolId },
      } = query?.where ?? ({} as any);

      // Get all user scopes and filter whem by query params if provided
      const userScopes = scope.permissions
        .getScopes(['users:read'])
        .filter((s) => !schoolId || s.schoolId === schoolId);

      // Create a scoped query for the user
      const scopedQuery = {
        where: [
          ...userScopes.map((s) => ({
            roles: {
              schoolId: s.schoolId,
            },
          })),
        ],
      };
      this.logger.debug(`Scoped Query: ${JSON.stringify(scopedQuery)}`);
      return scopedQuery;
    });
  }
}
