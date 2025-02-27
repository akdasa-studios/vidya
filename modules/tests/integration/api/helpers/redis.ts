import { Redis } from 'ioredis';

export const redis = new Redis({
  host: 'localhost', // TODO: configure by environment variable
  port: 6379, // TODO: configure by environment variable
});
