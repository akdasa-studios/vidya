import { registerAs } from '@nestjs/config';

export default registerAs('otp', () => ({
  alphabet: process.env.VIDYA_OTP_ALPHABET || '0123456789',
  length: parseInt(process.env.VIDYA_OTP_LENGTH, 10) || 6,
}));
