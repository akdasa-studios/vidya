import { Entities } from '@vidya/entities';
import { DataType, newDb } from 'pg-mem';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

export const inMemoryDataSource = async () => {
  const db = newDb();

  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  });

  db.public.registerFunction({
    name: 'version',
    returns: DataType.text,
    implementation: () =>
      'PostgreSQL 16.1 (Debian 16.1-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit',
    impure: true,
  });

  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: v4,
      impure: true,
    });
  });

  const ds: DataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: Entities,
    migrations: ['/workspaces/vidya/modules/services/database/migrations/*.ts'],
  });

  await ds.initialize();
  await ds.runMigrations();

  return ds;
};
