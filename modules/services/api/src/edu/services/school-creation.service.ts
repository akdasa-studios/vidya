import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, School, User } from '@vidya/entities';
import { Repository } from 'typeorm';

@Injectable()
export class SchoolCreationService {
  constructor(
    @InjectRepository(School) private readonly schools: Repository<School>,
  ) {}

  async createNewSchool(
    userId: string,
    params: Partial<School>,
  ): Promise<School> {
    return await this.schools.manager.transaction(async (transaction) => {
      // Create a new school
      const school = await transaction.save(School, params);

      // Create an admin role for the school
      const adminRole = await transaction.save(Role, {
        name: 'Owner',
        description: 'Owner of the school',
        schoolId: school.id,
        permissions: ['*'],
      });

      // Find the user
      const owner = await transaction.findOneOrFail(User, {
        where: { id: userId },
        relations: ['roles'],
      });
      owner.roles = [...(owner.roles ?? []), adminRole];
      await transaction.save(User, owner);

      // Return the created school
      return school;
    });
  }
}
