import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization'; // Assuming you have an Organization entity

@Entity({ name: 'schools' })
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: false})
  name: string;
 
  @Column({nullable: false})
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
