import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum LearningType {
  Individual = 'individual',
  Group = 'group',
}

// TODO: Add relation to School
@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LearningType,
    default: LearningType.Individual,
  })
  learningType: LearningType;
}
