import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User, UserRole } from '@vidya/entities';

import { OtpController } from './controllers/otp.controller';
import { TokensController } from './controllers/tokens.controller';
import { UserAuthenticationController } from './controllers/user-authentication.controller';
import { AuthRolesMappingProfile } from './mappers/roles.mapper';
import { AuthService } from './services/auth.service';
import { AuthUsersService } from './services/auth-users.service';
import { OtpService } from './services/otp.service';
import { RevokedTokensService } from './services/revokedTokens.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserRole]),
    JwtModule.register({ global: true }),
  ],
  controllers: [UserAuthenticationController, OtpController, TokensController],
  providers: [
    OtpService,
    AuthUsersService,
    AuthService,
    RevokedTokensService,
    AuthRolesMappingProfile,
  ],
})
export class AuthModule {}
