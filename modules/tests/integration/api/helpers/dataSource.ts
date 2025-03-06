import { DataSource } from 'typeorm';
import { Entities } from '@vidya/entities';
import { Client } from 'pg';

const ensureDatabaseExists = async (config: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}) => {
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
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [database],
    );
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${database}"`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
};

export const initializeDatabase = async () => {
  console.log(
    'Creating database for test worker:',
    process.env.TEST_WORKER_INDEX,
  );

  // const databaseName = 'test_api_' + process.env.TEST_WORKER_INDEX;
  // TDOD: use the same database name as API server usues
  const databaseName = 'postgres';
  await ensureDatabaseExists({
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: databaseName,
  });

  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: databaseName,
    entities: Entities,
    migrations: ['/workspaces/vidya/modules/services/database/migrations/*.ts'],
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.showMigrations();
  await dataSource.runMigrations();

  return dataSource;
};

export const destoryDatabase = async (dataSource: DataSource) => {
  await dataSource.dropDatabase();
  await dataSource.destroy();
};
