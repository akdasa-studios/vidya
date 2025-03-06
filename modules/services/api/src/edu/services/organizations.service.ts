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
      const orgIds = scope.permissions.getPermittedOrganizations(['orgs:read']);
      const result = {
        where: {
          ...query?.where,
          id: In(orgIds),
        },
      };
      return result;
    });
  }
}
