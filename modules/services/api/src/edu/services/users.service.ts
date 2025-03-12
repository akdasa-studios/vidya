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
      if (query?.where instanceof Array) {
        // TODO add support for query.where as array
        throw new Error('Array where clauses are not supported');
      }

      const where = query?.where as any;
      const schoolId = where?.roles?.schoolId;

      // Get all schools permitted for user
      const schoolIds = scope.permissions
        .getScopes(['users:read'])
        .filter((s) => !schoolId || s.schoolId === schoolId)
        .map((s) => s.schoolId);

      // Create a scoped query for the user
      const scopedQuery = {
        where: {
          id: where?.id,
          roles: {
            schoolId: In(schoolIds),
          },
        },
      };
      this.logger.debug(`Scoped Query: ${JSON.stringify(scopedQuery)}`);
      return scopedQuery;
    });
  }
}
