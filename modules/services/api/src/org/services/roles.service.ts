import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPermissions } from '@vidya/api/auth/utils';
import { Role, UserRole } from '@vidya/entities';
import { In, Repository } from 'typeorm';

import { EntitiesService } from './entities.service';

@Injectable()
export class RolesService extends EntitiesService<Role> {
  constructor(
    @InjectRepository(Role) repository: Repository<Role>,
    @InjectRepository(UserRole) private userRolesRepo: Repository<UserRole>,
  ) {
    super(repository);
  }

  /**
   * Returns a list of roles that the user has access to
   * based on the provided organization and school IDs.
   *
   * @param organizationId Organization ID to filter by
   * @param schoolId School ID to filter by
   * @returns A list of roles that the user has access to
   *          based on the provided organization and school IDs.
   */
  async findPermittedBy(
    permissions: UserPermissions,
    filter: {
      organizationId?: string;
      schoolId?: string;
      id?: string;
    },
  ): Promise<Role[]> {
    // get permitted organizations and schools
    const permittedOrgs = permissions.getPermittedOrganizations(['roles:read']);
    const permittedSchools = permissions.getPermittedSchools(['roles:read']);

    // get all all permitted organizations if no organizationId is provided
    // get provided organizationId if it is permitted
    const filterOrgs = filter.organizationId
      ? [filter.organizationId].filter((value) => permittedOrgs.includes(value))
      : permittedOrgs;

    // get all permitted schools if no schoolId is provided
    // get provided schoolId if it is permitted
    const filterSchools = filter.schoolId
      ? [filter.schoolId].filter((value) => permittedSchools.includes(value))
      : permittedSchools;

    // make a query to get roles based on the filters
    console.log('filterOrgs', filterOrgs);
    console.log('filterSchools', filterSchools);
    console.log('id', filter.id);
    return await this.repository.find({
      where: {
        organizationId: In(filterOrgs),
        schoolId: filter.schoolId && In(filterSchools),
        id: filter.id ? filter.id : undefined,
      },
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
