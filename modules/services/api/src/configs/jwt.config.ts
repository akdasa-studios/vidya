import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.VIDYA_JWT_SECRET || 'secret',
  accessTokenExpiresIn: process.env.VIDYA_JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.VIDYA_JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
}));
