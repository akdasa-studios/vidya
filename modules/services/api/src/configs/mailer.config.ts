import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => ({
  host: process.env.VIDYA_MAILER_HOST ?? 'localhost',
  port: parseInt(process.env.VIDYA_MAILER_PORT ?? '1025', 10),
  username: process.env.VIDYA_MAILER_USERNAME ?? 'mailer',
  password: process.env.VIDYA_MAILER_PASSWORD ?? 'password',
  from: {
    name: process.env.VIDYA_MAILER_FROM_NAME ?? 'Vidya',
    address: process.env.VIDYA_MAILER_FROM_ADDRESS ?? 'test@vidya.dev',
  },
}));
