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
      let orgIds = scope.permissions.getOrganizations(['orgs:read']);

      // If the query has an id, so check if it is in the list of
      // organization ids that the user has access to.
      if (where?.id) {
        orgIds = [where.id].filter((id) => orgIds.includes(id));
      }

      return {
        where: {
          ...query?.where,
          id: In(orgIds),
        },
      };
    });
  }
}
