import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@vidya/entities';
import { Repository } from 'typeorm';

import { EntitiesService } from './entities.service';

@Injectable()
export class RolesService extends EntitiesService<Role> {
  constructor(@InjectRepository(Role) repository: Repository<Role>) {
    super(repository);
  }
}
