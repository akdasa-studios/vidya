import { Entity, Column, PrimaryGeneratedColumn, Index, Check } from 'typeorm';

@Entity({ name: 'users' })
@Check(`"email" IS NOT NULL OR "phone" IS NOT NULL`)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Index({ unique: true })
  @Column({ nullable: true })
  email: string;

  @Index()
  @Column({ nullable: true })
  phone: string;
}
