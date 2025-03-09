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
@ApiTags('Authentication')
export class LoginController {
  constructor(
    @Inject(AuthConfig.KEY)
    private readonly authConfig: ConfigType<typeof AuthConfig>,
    private readonly otpService: OtpService,
    private readonly usersService: AuthUsersService,
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
    type: dto.OtpLogInRequest,
    description: 'User has been authorized.',
  })
  @ApiUnauthorizedResponse({
    type: dto.ErrorResponse,
    description: 'OTP is invalid.',
  })
  @ApiTooManyRequestsResponse({
    type: dto.ErrorResponse,
    description: 'Too many requests',
  })
  async loginWithOtp(
    @Body() request: dto.OtpLogInRequest,
  ): Promise<dto.OtpLogInResponse> {
    // TODO rate limit login attempts

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

    return new dto.OtpLogInResponse({
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
    type: dto.LogOutResponse,
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
    @Body() request: dto.LogOutRequest,
    @UserAccessToken() userAccessToken: JwtToken,
  ): Promise<dto.LogOutResponse> {
    // revoke access token to prevent reusing it
    await this.revokedTokensService.revoke(userAccessToken);

    // revoke refresh token if still valid
    const token = await this.authService.verifyToken(request.refreshToken);
    if (token) {
      await this.revokedTokensService.revoke(token);
    }

    // user logged out
    return new dto.LogOutResponse();
  }
}
