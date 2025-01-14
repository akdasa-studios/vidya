import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '@vidya/entities';
import { Repository } from 'typeorm';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private usersRepository: Repository<Organization>,
  ) {}

  findAll(): Promise<Organization[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<Organization | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
