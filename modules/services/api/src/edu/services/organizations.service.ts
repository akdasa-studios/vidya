import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPermissions } from '@vidya/api/auth/utils';
import { Organization } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { ScopedEntitiesService } from './entities.service';

@Injectable()
export class OrganizationsService extends ScopedEntitiesService<
  Organization,
  UserPermissions
> {
  constructor(
    @InjectRepository(Organization) repository: Repository<Organization>,
  ) {
    super(repository, (query, userPermissions) => {
      const orgIds = userPermissions.getPermittedOrganizations(['orgs:read']);
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
