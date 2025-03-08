import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { Scope, ScopedEntitiesService } from './entities.service';

@Injectable()
export class SchoolsService extends ScopedEntitiesService<School, Scope> {
  constructor(@InjectRepository(School) repository: Repository<School>) {
    super(repository, (query, scope) => {
      const orgIds = scope.permissions.getOrganizations(['orgs:read']);
      const schoolIds = scope.permissions.getSchools(['schools:read']);
      return {
        where: {
          ...query?.where,
          id: schoolIds.length > 0 ? In(schoolIds) : undefined,
          organizationId: In(orgIds),
        },
      };
    });
  }
}
