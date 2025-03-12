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
import { UserId } from '@vidya/api/auth/decorators';
import * as dto from '@vidya/api/auth/dto';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import { AuthUsersService } from '@vidya/api/auth/services';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiTags('Authentication')
export class ProfileController {
  constructor(private readonly usersService: AuthUsersService) {}

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
    type: dto.GetProfileResponse,
    description: 'User profile has been returned.',
  })
  @ApiUnauthorizedResponse({
    type: dto.ErrorResponse,
    description: 'User is not authorized.',
  })
  async profile(@UserId() userId: string): Promise<dto.GetProfileResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException(['user is not authorized']);
    }

    return new dto.GetProfileResponse({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  }
}
