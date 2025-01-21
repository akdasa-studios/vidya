import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course';

export enum GroupStatus {
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive',
}

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  courseId: string;

  @ManyToOne(() => Course)
  @JoinColumn()
  course: Course;

  @Column({ nullable: true })
  startsAt: Date;

  @Column({
    type: 'enum',
    enum: GroupStatus,
    default: GroupStatus.Pending,
    enumName: 'groupStatus',
  })
  status: GroupStatus;
}
