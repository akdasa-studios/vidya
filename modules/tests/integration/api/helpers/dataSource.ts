import { DataSource } from 'typeorm';
import { Entities } from '@vidya/entities';

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: Entities,
  logging: false,
});
