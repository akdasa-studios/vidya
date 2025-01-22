import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';

@Module({
  imports: [],
  controllers: [AuthController, OtpController],
  providers: [OtpService],
})
export class AuthModule {}
