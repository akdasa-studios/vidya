import { Get, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Routes } from '@vidya/protocol';
import { ErrorResponse, GetProfileResponse } from '../models/auth';
import { UsersService } from '../services/users';
import { UserId } from '../utils/authenticatedUserId';
import { AuthenticatedUser } from '../utils/authenticatedUserGuard';

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
