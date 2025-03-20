import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authentication } from '@vidya/api/auth/decorators';
import { AuthenticatedUserGuard } from '@vidya/api/auth/guards';
import { UserAuthentication } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { UserSchoolsService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/shared/decorators';
import { Routes } from '@vidya/protocol';

import { UserExistsPipe } from '../../pipes';

// TODO Add documentation configurations, to change doc:
//      Get many UserSchools    -> Get all schools of a user
//      Create a new UserSchool -> Set schools for a user
const Crud = CrudDecorators({
  entityName: 'UserSchools',
  getManyResponseDto: dto.GetUserSchoolsListResponse,
  updateOneResponseDto: dto.AddUserSchoolsResponse,
});

@Controller()
@ApiTags('🧝 Education :: Users')
@ApiBearerAuth()
@UseGuards(AuthenticatedUserGuard)
export class UserSchoolsController {
  constructor(private readonly userSchoolsService: UserSchoolsService) {}

  /* -------------------------------------------------------------------------- */
  /*                        GET /edu/users/:userId/schools                      */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.user(':userId').schools.all())
  async getAll(
    @Param('userId') userId: string,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.GetUserSchoolsListResponse> {
    // Check if the user has permission to read the schools
    const schoolIds = await this.userSchoolsService.getUserSchools(userId);
    const scope = schoolIds.map((id) => ({ schoolId: id }));
    if (!auth.permissions.has(['users:read'], scope)) {
      throw new ForbiddenException('User does not have permission');
    }

    // Return the list of school ids
    return new dto.GetUserSchoolsListResponse(schoolIds);
  }

  /* -------------------------------------------------------------------------- */
  /*                        POST /edu/users/:userId/schools                     */
  /* -------------------------------------------------------------------------- */

  @Crud.UpdateOne(Routes().edu.user(':userId').schools.create())
  async set(
    @Param('userId', new ParseUUIDPipe(), UserExistsPipe) userId: string,
    @Body() request: dto.AddUserSchoolsRequest,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.AddUserSchoolsResponse> {
    if (auth.userId != userId) {
      throw new ForbiddenException('User does not have permission');
    }
    await this.userSchoolsService.addUser(userId, request.schoolId);
    return new dto.AddUserSchoolsResponse({ success: true });
  }
}
