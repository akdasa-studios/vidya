import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.VIDYA_REDIS_HOST || 'localhost',
  port: parseInt(process.env.VIDYA_REDIS_PORT, 10) || 6379,
}));
