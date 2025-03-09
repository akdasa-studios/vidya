import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, UserRole } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { Scope, ScopedEntitiesService } from './entities.service';

@Injectable()
export class RolesService extends ScopedEntitiesService<Role, Scope> {
  constructor(
    @InjectRepository(Role) repository: Repository<Role>,
    @InjectRepository(UserRole) private userRolesRepo: Repository<UserRole>,
  ) {
    super(repository, (query, scope) => {
      // HACK: For some reason FindOptionsWhere<Organization> doesn't
      //       work here, so we have to cast it to any. It doesn't contain
      //       any fields like id, name, etc. But it should.
      const { organizationId, schoolId } = query?.where as any;

      // Get all scopes that have the required permission
      // and match the organization and school ids in the query
      // if they are provided
      const scopes = scope.permissions
        .getScopes(['roles:read'])
        .filter(
          (s) =>
            (!organizationId || s.organizationId === organizationId) &&
            (!schoolId || s.schoolId === schoolId),
        );

      // Return the query with the scopes applied or an empty query
      // if no scopes were found for the user permissions
      return scopes.length > 0
        ? {
            where: scopes.map((s) => ({
              ...query?.where,
              organizationId: s.organizationId,
              schoolId: s.schoolId,
            })),
          }
        : { where: { organizationId: In([]) } };
    });
  }

  async getRolesOfUser(userId: string): Promise<Role[]> {
    return await this.repository
      .createQueryBuilder('role')
      .innerJoin('role.userRoles', 'userRole')
      .where('userRole.userId = :userId', { userId })
      .getMany();
  }

  async setRolesForUser(userId: string, roleIds: string[]): Promise<void> {
    const existing = await this.userRolesRepo.findBy({ userId });

    // find roles to add or remove
    const rolesToAssign = roleIds.filter(
      (roleId) => !existing.some((userRole) => userRole.roleId === roleId),
    );
    const rolesToRemove = existing.filter(
      (userRole) => !roleIds.includes(userRole.roleId),
    );

    // perform the changes in a single transaction
    await this.userRolesRepo.manager.transaction(
      async (transactionalEntityManager) => {
        await Promise.all([
          ...rolesToAssign.map(async (roleId) => {
            const userRole = this.userRolesRepo.create({ userId, roleId });
            await transactionalEntityManager.save(userRole);
          }),
          ...rolesToRemove.map(async (userRole) => {
            await transactionalEntityManager.remove(userRole);
          }),
        ]);
      },
    );
  }
}
