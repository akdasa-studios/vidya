import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ErrorResponse,
  LogOutRequest,
  LogOutResponse,
  OtpLogInRequest,
  OtpLogInResponse,
} from '@vidya/api/auth/models';
import {
  AuthService,
  OtpService,
  RevokedTokensService,
  UsersService,
} from '@vidya/api/auth/services';
import {
  AuthenticatedUser,
  UserAccessToken,
  UserId,
} from '@vidya/api/auth/utils';
import { JwtToken, OtpType, Routes } from '@vidya/protocol';

@Controller()
@ApiTags('Authentication')
export class LoginController {
  constructor(
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly revokedTokensService: RevokedTokensService,
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
    type: OtpLogInRequest,
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
  async loginWithOtp(
    @Body() request: OtpLogInRequest,
  ): Promise<OtpLogInResponse> {
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

    return new OtpLogInResponse({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                              POST /auth/logout                             */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().auth.logout())
  @UseGuards(AuthenticatedUser)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log out user',
    operationId: 'auth::logout',
    description:
      `Log out user.\n\n` + `Revokes the refresh token and logs out the user.`,
  })
  @ApiOkResponse({
    type: LogOutResponse,
    description: 'User has been logged out.',
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Invalid request.',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponse,
    description: 'Unauthorized request.',
  })
  async logoutUser(
    @Body() request: LogOutRequest,
    @UserId() userId: string,
    @UserAccessToken() userAccessToken: JwtToken,
  ): Promise<LogOutResponse> {
    // revoke access token to prevent reusing it
    await this.revokedTokensService.revoke(userAccessToken);

    // revoke refresh token if still valid
    const token = await this.authService.verifyToken(request.refreshToken);
    if (token) {
      await this.revokedTokensService.revoke(token);
    }

    // user logged out
    return new LogOutResponse();
  }
}
