import { Body, Controller, Post } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { OtpType, Routes } from '@vidya/protocol';

import { AuthRequest, AuthResponse, ErrorResponse } from '../models/auth';
import { AuthService } from '../services/auth';
import { OtpService } from '../services/otp';
import { UsersService } from '../services/users';

@Controller()
@ApiTags('Authentication')
export class LoginController {
  constructor(
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                            POST /auth/login/otp                            */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().auth.login('otp'))
  @ApiOperation({
    summary: 'Authorizes user',
    operationId: 'auth::login',
    description:
      `Authorizes user by OTP.\n\n` +
      `Returns access and refresh tokens if the user has been authorized.`,
  })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'User has been authorized.',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponse,
    description: 'OTP is invalid.',
  })
  @ApiTooManyRequestsResponse({
    type: ErrorResponse,
    description: 'Too many requests',
  })
  async loginWithOtp(@Body() request: AuthRequest): Promise<AuthResponse> {
    // TODO: rate limit login attempts

    // validate OTP, if invalid send 401 Unauthorized response
    const otp = await this.otpService.validate(request.login, request.otp);
    if (!otp) {
      throw new UnauthorizedException(['otp is invalid']);
    }

    // get or create user by login and start new session
    const otpTypeToLoginFieldMap = {
      [OtpType.Email]: 'email',
      [OtpType.Sms]: 'phone',
    } as const;
    const user = await this.usersService.getOrCreateByLogin(
      otpTypeToLoginFieldMap[otp.type],
      request.login,
    );
    const tokens = await this.authService.generateTokens(user.id);

    return new AuthResponse({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }
}
