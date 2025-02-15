import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@vidya/entities';

import { LoginController } from './controllers/login';
import { LogOutController } from './controllers/logout';
import { OtpController } from './controllers/otp';
import { ProfileController } from './controllers/profile';
import { TokensController } from './controllers/tokens';
import { AuthService } from './services/auth';
import { OtpService } from './services/otp';
import { RevokedTokensService } from './services/revokedTokens';
import { UsersService } from './services/users';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  controllers: [
    LoginController,
    OtpController,
    TokensController,
    ProfileController,
    LogOutController,
  ],
  providers: [OtpService, UsersService, AuthService, RevokedTokensService],
})
export class AuthModule {}
