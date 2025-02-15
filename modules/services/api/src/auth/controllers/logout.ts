import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Routes } from '@vidya/protocol';
import { ErrorResponse, LogOutRequest, LogOutResponse } from '../models/auth';
import { RevokedTokensService } from '../services/revokedTokens';
import { AuthService } from '../services/auth';
import { UserId, UserAccessToken } from '../utils/authenticatedUserId';
import { JwtToken } from '@vidya/protocol';
import { AuthenticatedUser } from '../utils/authenticatedUserGuard';

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
    console.log('userId', userId);
    console.log('userAccessToken', userAccessToken);

    // revoke access token to prevent reusing it
    await this.revokedTokensService.revoke(userAccessToken);

    // revoke refresh token if still valid
    const token = await this.authService.verifyToken(request.refreshToken);
    if (!token) {
      await this.revokedTokensService.revoke(token);
    }

    // user logged out
    return new LogOutResponse();
  }
}
