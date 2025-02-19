import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { UserRole } from './userRole';
import { School } from './school';
import { Organization } from './organization';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  organizationId: string;

  @Column({ nullable: true })
  schoolId: string;

  @OneToOne(() => Organization)
  organization: Organization;

  @OneToOne(() => School)
  school: School;

  @Column('varchar', { array: true, nullable: true })
  permissions: string[];

  @OneToMany(() => UserRole, userRole => userRole.role)
  public userRoles: UserRole[];
}
