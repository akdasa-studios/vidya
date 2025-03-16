import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserAccessToken } from '@vidya/api/auth/decorators';
import * as dto from '@vidya/api/auth/dto';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import {
  AuthService,
  AuthUsersService,
  OtpService,
  RevokedTokensService,
} from '@vidya/api/auth/services';
import { AuthConfig } from '@vidya/api/configs';
import { JwtToken, OtpType, Routes } from '@vidya/protocol';

@Controller()
@ApiTags('🔐 Authentication')
export class UserAuthenticationController {
  constructor(
    @Inject(AuthConfig.KEY)
    private readonly authConfig: ConfigType<typeof AuthConfig>,
    private readonly otpService: OtpService,
    private readonly usersService: AuthUsersService,
    private readonly authService: AuthService,
    private readonly revokedTokensService: RevokedTokensService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                            POST /auth/signin/otp                           */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().auth.signIn('otp'))
  @ApiOperation({
    summary: 'Signs user in with OTP',
    operationId: 'auth::signIn',
    description:
      `Signs user in with one-time password.\n\n` +
      `Returns access and refresh tokens if the user has been authenticated.`,
  })
  @ApiOkResponse({
    type: dto.OtpSignInRequest,
    description: 'User has been authenticated.',
  })
  @ApiUnauthorizedResponse({
    type: dto.ErrorResponse,
    description: 'OTP is invalid.',
  })
  @ApiTooManyRequestsResponse({
    type: dto.ErrorResponse,
    description: 'Too many requests',
  })
  async signinWithOtp(
    @Body() request: dto.OtpSignInRequest,
  ): Promise<dto.OtpSignInResponse> {
    // TODO rate limit login attempts by login

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
    const tokens = await this.authService.generateTokens(
      user.id,
      this.authConfig.savePermissionsInJwtToken
        ? await this.usersService.getUserPermissions(user.id)
        : undefined,
    );

    return new dto.OtpSignInResponse({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                              POST /auth/logout                             */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().auth.signOut())
  @UseGuards(AuthenticatedUser)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Signs user out',
    operationId: 'auth::signOut',
    description:
      `Signs user out.\n\n` +
      `Revokes the refresh token and signs the user out.`,
  })
  @ApiOkResponse({
    type: dto.SignOutResponse,
    description: 'User has been logged out.',
  })
  @ApiBadRequestResponse({
    type: dto.ErrorResponse,
    description: 'Invalid request.',
  })
  @ApiUnauthorizedResponse({
    type: dto.ErrorResponse,
    description: 'Unauthorized request.',
  })
  async logoutUser(
    @Body() request: dto.SignOutRequest,
    @UserAccessToken() userAccessToken: JwtToken,
  ): Promise<dto.SignOutResponse> {
    // revoke access token to prevent reusing it
    await this.revokedTokensService.revoke(userAccessToken);

    // revoke refresh token if still valid
    const token = await this.authService.verifyToken(request.refreshToken);
    if (token) {
      await this.revokedTokensService.revoke(token);
    }

    // user logged out
    return new dto.SignOutResponse();
  }
}
