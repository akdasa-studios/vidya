import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@vidya/entities';
import { Repository } from 'typeorm';

import { EntitiesService } from './entities.service';

@Injectable()
export class UsersService extends EntitiesService<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository);
  }
}
