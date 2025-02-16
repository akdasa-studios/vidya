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
import {
  ErrorResponse,
  RefreshTokensRequest,
  RefreshTokensResponse,
} from '@vidya/api/auth/models';
import { AuthService, RevokedTokensService } from '@vidya/api/auth/services';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiTags('Authentication')
export class TokensController {
  constructor(
    private readonly revokedTokensService: RevokedTokensService,
    private readonly authService: AuthService,
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
    type: RefreshTokensResponse,
    description: 'Tokens have been refreshed.',
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Unable to refresh tokens.',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponse,
    description: 'Refresh token is invalid.',
  })
  async refreshTokens(
    @Body() request: RefreshTokensRequest,
  ): Promise<RefreshTokensResponse> {
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

    // generate new tokens
    const tokens = await this.authService.generateTokens(refreshToken.sub);
    return new RefreshTokensResponse({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }
}
