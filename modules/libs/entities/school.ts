import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization';

@Entity({ name: 'schools' })
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  organizationId: string;

  @ManyToOne(
    () => Organization,
    org => org.schools,
    { nullable: false }
  )
  @JoinColumn()
  organization: Organization;
}
