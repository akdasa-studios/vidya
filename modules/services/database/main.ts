import { DataSource } from 'typeorm';
import { Entities } from '@vidya/entities';

export const MainDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  logging: true,
  entities: Entities,
  migrations: ['./dist/services/database/migrations/**/*.js'],
});
