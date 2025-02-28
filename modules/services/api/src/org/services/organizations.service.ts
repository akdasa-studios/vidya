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

  /**
   * Retuns a scoped request for the current user permissions.
   * @param userPermissions User permissions.
   * @returns Scoped request.
   */
  scopedBy(userPermissions: UserPermissions): ScopedOrganizationsRequest {
    return new ScopedOrganizationsRequest(userPermissions, this);
  }
}

class ScopedOrganizationsRequest {
  constructor(
    private readonly userPermissions: UserPermissions,
    private readonly service: OrganizationsService,
  ) {}

  /**
   * Returns all organizations that the user has permission to read.
   * @param filter Filter to apply.
   * @returns Organizations.
   */
  async findAllBy(filter?: { id?: string }): Promise<Organization[]> {
    const orgIds = this.userPermissions.getPermittedOrganizations([
      'orgs:read',
    ]);
    const filterOrgIds = filter?.id
      ? [filter.id].filter((id) => orgIds.includes(id))
      : orgIds;

    return await this.service.findAllBy({
      where: {
        id: In(filterOrgIds),
      },
    });
  }
}
