import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { UserRole } from './userRole';
import { User } from './user';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column('varchar', { array: true, nullable: true })
  permissions: string[];

  @OneToMany(() => UserRole, userRole => userRole.role)
  public userRoles: UserRole[];

  @ManyToMany(() => User, user => user.roles)
  public users: User[];
}
