import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { School } from './school';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => School, school => school.organization)
  schools: School[];
}
