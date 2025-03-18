import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export type SchoolConfig = {
  /**
   * The default role for students in this school.
   * This role will be assigned to students when they are joined.
   */
  defaultStudentRoleId: string;
  
  /**
   * List of student roles that are available in this school.
   */
  studentRoleIds: string[];
};

@Entity({ name: 'schools' })
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, type: 'json', default: {} })
  config: SchoolConfig;
}
