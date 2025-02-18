import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import * as dto from '@vidya/api/auth/dto';
import {
  AuthService,
  RevokedTokensService,
  UsersService,
} from '@vidya/api/auth/services';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiTags('Authentication')
export class TokensController {
  constructor(
    private readonly revokedTokensService: RevokedTokensService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                          POST /auth/token/refresh                          */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().auth.tokens.refresh())
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refreshes access token',
    operationId: 'auth::tokens::refresh',
    description:
      `Refreshes access token.\n\n` +
      `Returns new access and refresh tokens if the refresh token is valid.`,
  })
  @ApiOkResponse({
    type: dto.RefreshTokensResponse,
    description: 'Tokens have been refreshed.',
  })
  @ApiBadRequestResponse({
    type: dto.ErrorResponse,
    description: 'Unable to refresh tokens.',
  })
  @ApiUnauthorizedResponse({
    type: dto.ErrorResponse,
    description: 'Refresh token is invalid.',
  })
  async refreshTokens(
    @Body() request: dto.RefreshTokensRequest,
  ): Promise<dto.RefreshTokensResponse> {
    // verify refresh token, if invalid send 401 Unauthorized response
    const refreshToken = await this.authService.verifyToken(
      request.refreshToken,
    );
    if (!refreshToken) {
      throw new UnauthorizedException(['Refresh token is invalid or expired']);
    }

    // check if the refresh token is revoked
    const isRefreshTokenRevoked =
      await this.revokedTokensService.isRevoked(refreshToken);
    if (isRefreshTokenRevoked) {
      throw new UnauthorizedException(['Refresh token is revoked']);
    }

    // revoke the refresh token to prevent replay attacks
    this.revokedTokensService.revoke(refreshToken);

    // get user
    const user = await this.usersService.findById(refreshToken.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const permissions = user.roles.flatMap((role) => role.permissions);

    // generate new tokens
    const tokens = await this.authService.generateTokens(
      refreshToken.sub,
      permissions,
    );
    return new dto.RefreshTokensResponse({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }
}
