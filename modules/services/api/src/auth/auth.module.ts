import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@vidya/entities';

import { LoginController } from './controllers/login.controller';
import { OtpController } from './controllers/otp.controller';
import { ProfileController } from './controllers/profile.controller';
import { TokensController } from './controllers/tokens.controller';
import { AuthRolesMappingProfile } from './mappers/roles.mapper';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { RevokedTokensService } from './services/revokedTokens.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ global: true }),
  ],
  controllers: [
    LoginController,
    OtpController,
    TokensController,
    ProfileController,
  ],
  providers: [
    OtpService,
    UsersService,
    AuthService,
    RevokedTokensService,
    AuthRolesMappingProfile,
  ],
  exports: [RevokedTokensService],
})
export class AuthModule {}
