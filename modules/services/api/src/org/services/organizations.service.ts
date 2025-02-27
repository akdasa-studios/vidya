import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '@vidya/entities';
import { Repository } from 'typeorm';

import { EntitiesService } from './entities.service';

@Injectable()
export class OrganizationsService extends EntitiesService<Organization> {
  constructor(
    @InjectRepository(Organization) repository: Repository<Organization>,
  ) {
    super(repository);
  }
}
