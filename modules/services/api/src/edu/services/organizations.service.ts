import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { Scope, ScopedEntitiesService } from './entities.service';

@Injectable()
export class OrganizationsService extends ScopedEntitiesService<
  Organization,
  Scope
> {
  constructor(
    @InjectRepository(Organization) repository: Repository<Organization>,
  ) {
    super(repository, (query, scope) => {
      // HACK: For some reason FindOptionsWhere<Organization> doesn't
      //       work here, so we have to cast it to any. It doesn't contain
      //       any fields like id, name, etc. But it should.
      const where = query?.where as any;

      // Get all scopes that have the required permission and match the
      // organization id in the query if it is provided
      const scopes = scope.permissions
        .getScopes(['orgs:read'])
        .filter((s) => !where?.id || s.organizationId === where?.id);

      // Return the query with the scopes applied or an empty query
      // if no scopes were found for the user permissions
      return scopes.length > 0
        ? {
            where: scopes.map((s) => ({
              ...query?.where,
              id: s.organizationId,
            })),
          }
        : { where: { id: In([]) } };
    });
  }
}
