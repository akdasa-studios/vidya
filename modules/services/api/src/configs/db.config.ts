import { registerAs } from '@nestjs/config';

export default registerAs('db', () => ({
  type: (process.env.VIDYA_DB_TYPE || 'postgres') as 'postgres' | 'mysql',
  host: process.env.VIDYA_DB_HOST || 'localhost',
  port: parseInt(process.env.VIDYA_DB_PORT, 10) || 5432,
  username: process.env.VIDYA_DB_USERNAME || 'postgres',
  password: process.env.VIDYA_DB_PASSWORD || 'postgres',
  database: process.env.VIDYA_DB_DATABASE || 'postgres',
  schema: process.env.VIDYA_DB_SCHEMA || 'public',
  logging: (process.env.VIDYA_DB_LOGGING ?? 'true') === 'true',
}));
