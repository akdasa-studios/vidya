import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPermissions } from '@vidya/api/auth/utils';
import { Organization } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { EntitiesService } from './entities.service';

@Injectable()
export class OrganizationsService extends EntitiesService<Organization> {
  constructor(
    @InjectRepository(Organization) repository: Repository<Organization>,
  ) {
    super(repository);
  }

  async findPermittedOrganizationsBy(
    permissions: UserPermissions,
    filter?: {
      id?: string;
    },
  ): Promise<Organization[]> {
    const orgIds = permissions.getPermittedOrganizations(['orgs:read']);
    const filterOrgIds = filter?.id
      ? [filter.id].filter((id) => orgIds.includes(id))
      : orgIds;

    return await this.repository.find({
      where: {
        id: In(filterOrgIds),
      },
    });
  }
}
