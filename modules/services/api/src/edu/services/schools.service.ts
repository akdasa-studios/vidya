import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { Scope, ScopedEntitiesService } from './entities.service';

@Injectable()
export class SchoolsService extends ScopedEntitiesService<School, Scope> {
  constructor(@InjectRepository(School) repository: Repository<School>) {
    super(repository, (query, scope) => {
      // HACK: For some reason FindOptionsWhere<School> doesn't
      //       work here, so we have to cast it to any. It doesn't contain
      //       any fields like id, name, etc. But it should.
      const where = query?.where as any;

      // TODO Haven't tested yet

      // Get all scopes that have the required permission
      // and match the school ids in the query if they are provided
      const scopes = scope.permissions
        .getScopes(['schools:read'])
        .filter((s) => !where?.id || s.schoolId === where?.id);

      // Return the query with the scopes applied or an empty query
      // if no scopes were found for the user permissions
      return scopes.length > 0
        ? {
            where: scopes.map((s) => ({
              ...query?.where,
              id: s.schoolId,
            })),
          }
        : { where: { id: In([]) } };
    });
  }
}
