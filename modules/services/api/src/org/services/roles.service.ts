import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, UserRole } from '@vidya/entities';
import { Repository } from 'typeorm';

import { EntitiesService } from './entities.service';

@Injectable()
export class RolesService extends EntitiesService<Role> {
  constructor(
    @InjectRepository(Role) repository: Repository<Role>,
    @InjectRepository(UserRole) private userRolesRepo: Repository<UserRole>,
  ) {
    super(repository);
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
