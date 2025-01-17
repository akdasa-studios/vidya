import { DataSource } from 'typeorm';
import { Entities } from '@vidya/entities';
import { Migrations } from '@vidya/database';
import { Client} from 'pg';

let dataSource: DataSource;

const ensureDatabaseExists = async (config: { host: string; port: number; username: string; password: string; database: string }) => {
  const { host, port, username, password, database } = config;
  const client = new Client({
    host,
    port,
    user: username,
    password,
    database: 'postgres', // Connect to a default database first
  });

  try {
    await client.connect();
    const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [database]);
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${database}"`);
      console.log(`Database "${database}" created successfully.`);
    } else {
      console.log(`Database "${database}" already exists.`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
};

beforeEach(async () => {
  await ensureDatabaseExists({
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'test',
  })

  dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'test',
    dropSchema: true,
    entities: Entities,
    migrations: Migrations,
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
});

afterEach(async () => {
  await dataSource.destroy();
});

export { dataSource };