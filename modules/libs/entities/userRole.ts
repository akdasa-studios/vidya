import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm"
import { Role } from "./role"
import { User } from "./user"

@Entity({ name: 'userRoles' })
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column()
  public userId: string

  @Column()
  public roleId: string

  @ManyToOne(() => User, (user) => user.userRoles)
  public user: User

  @ManyToOne(() => Role, (role) => role.userRoles)
  public role: Role
}
