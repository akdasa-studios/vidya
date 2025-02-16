import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponse, GetProfileResponse } from '@vidya/api/auth/models';
import { UsersService } from '@vidya/api/auth/services';
import { AuthenticatedUser, UserId } from '@vidya/api/auth/utils';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiTags('User')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  /* -------------------------------------------------------------------------- */
  /*                              GET /auth/profile                             */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().auth.profile())
  @UseGuards(AuthenticatedUser)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Returns user profile',
    operationId: 'auth::profile',
  })
  @ApiOkResponse({
    type: GetProfileResponse,
    description: 'User profile has been returned.',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponse,
    description: 'User is not authorized.',
  })
  async profile(@UserId() userId: string): Promise<GetProfileResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException(['user is not authorized']);
    }

    return new GetProfileResponse({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  }
}
