import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Routes } from '@vidya/protocol';
import { JwtToken } from '@vidya/protocol';

import { LogOutRequest, LogOutResponse } from '../models/auth';
import { ErrorResponse } from '../models/common';
import { AuthService } from '../services/auth';
import { RevokedTokensService } from '../services/revokedTokens';
import { AuthenticatedUser } from '../utils/authenticatedUserGuard';
import { UserAccessToken, UserId } from '../utils/authenticatedUserId';

@Controller()
@ApiTags('Authentication')
export class LogOutController {
  constructor(
    private readonly authService: AuthService,
    private readonly revokedTokensService: RevokedTokensService,
  ) {}

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
