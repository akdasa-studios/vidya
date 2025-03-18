import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, School, User } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { Scope, ScopedEntitiesService } from './entities.service';

@Injectable()
export class SchoolsService extends ScopedEntitiesService<School, Scope> {
  constructor(
    @InjectRepository(School) repository: Repository<School>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    super(repository, (query, scope) => {
      // HACK: For some reason FindOptionsWhere<School> doesn't
      //       work here, so we have to cast it to any. It doesn't contain
      //       any fields like id, name, etc. But it should.
      const where = query?.where as any;

      // TODO Haven't tested yet

      // Get all scopes that have the required permission
      // and match the school ids in the query if they are provided
      const scopes = scope.permissions
        .getScopes(['schools:read'])
        .filter((s) => !where?.id || s.schoolId === where?.id);

      // Return the query with the scopes applied or an empty query
      // if no scopes were found for the user permissions
      return scopes.length > 0
        ? {
            where: scopes.map((s) => ({
              ...query?.where,
              id: s.schoolId,
            })),
          }
        : { where: { id: In([]) } };
    });
  }

  async getUserSchools(userId: string): Promise<string[]> {
    const user = await this.users.findOneOrFail({
      where: { id: userId },
      relations: ['roles'],
    });
    const schoolRoles = await this.roles.find({
      where: {
        id: In(user.roles.map((role) => role.id)),
      },
    });
    return schoolRoles.map((role) => role.schoolId);
  }

  async addUser(userId: string, schoolId: string): Promise<void> {
    await this.repository.manager.transaction(
      async (transactionalEntityManager) => {
        const school = await transactionalEntityManager.findOneByOrFail(
          School,
          { id: schoolId },
        );
        const user = await transactionalEntityManager.findOneOrFail(User, {
          where: { id: userId },
          relations: ['roles'],
        });
        const studentDefaultRole =
          await transactionalEntityManager.findOneByOrFail(Role, {
            id: school.config.defaultStudentRoleId,
          });
        user.roles.push(studentDefaultRole);
        await transactionalEntityManager.save(user);
      },
    );
  }
}
