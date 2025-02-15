import { Module } from '@nestjs/common';
import { LoginController } from './controllers/login';
import { OtpService } from './services/otp';
import { OtpController } from './controllers/otp';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@vidya/entities';
import { UsersService } from './services/users';
import { AuthService } from './services/auth';
import { JwtModule } from '@nestjs/jwt';
import { ProfileController } from './controllers/profile';
import { TokensController } from './controllers/tokens';
import { RevokedTokensService } from './services/revokedTokens';
import { LogOutController } from './controllers/logout';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'SECRET', // TODO: use env variable
    }),
  ],
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
