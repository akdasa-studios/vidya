import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  savePermissionsInJwtToken:
    process.env.VIDYA_AUTH_SAVE_PERMISSIONS_IN_JWT_TOKEN === 'true',
}));
