import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, School, User } from '@vidya/entities';
import { In, Repository } from 'typeorm';

@Injectable()
export class UserSchoolsService {
  constructor(
    @InjectRepository(School) private readonly schools: Repository<School>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  /**
   * Get all schools the user is associated with
   * @param userId User ID to get schools for
   * @returns List of school IDs the user is associated with
   */
  async getUserSchools(userId: string): Promise<string[]> {
    // get user by id with all roles
    const user = await this.users.findOneOrFail({
      where: { id: userId },
      relations: ['roles'],
    });
    const allUserRolesId = user.roles.map((role) => role.id);

    // get all school roles for the user roles
    const schoolRoles = await this.roles.find({
      where: { id: In(allUserRolesId) },
    });

    // return school ids from the school roles
    return schoolRoles.map((role) => role.schoolId);
  }

  /**
   * Add a user to a school
   * @param userId User to add to school to
   * @param schoolId School to add user to
   */
  async addUser(userId: string, schoolId: string): Promise<void> {
    await this.schools.manager.transaction(
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
