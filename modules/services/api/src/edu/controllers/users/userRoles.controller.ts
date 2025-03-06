import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import * as dto from '@vidya/api/edu/dto';
import { RolesService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/utils';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

const Crud = CrudDecorators({
  entityName: 'Role',
  getManyResponseDto: dto.GetUserRolesListResponse,
  createOneResponseDto: dto.SetUserRolesResponse,
});

@Controller()
@ApiTags('Users')
@UseGuards(AuthenticatedUser)
export class UserRolesController {
  constructor(
    private readonly rolesService: RolesService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                        GET /edu/users/:userId/roles                        */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.user(':userId').roles.all())
  async getAll(
    @Query() request: dto.GetUserRolesListRequest,
  ): Promise<dto.GetUserRolesListResponse> {
    const roles = await this.rolesService.getRolesOfUser(request.userId);
    const userRoles = this.mapper.mapArray(roles, entities.Role, dto.UserRole);
    return new dto.GetUserRolesListResponse(userRoles);
  }

  /* -------------------------------------------------------------------------- */
  /*                        POST /edu/users/:userId/roles                       */
  /* -------------------------------------------------------------------------- */

  @Crud.CreateOne(Routes().edu.user(':userId').roles.create())
  async set(
    @Query() query: dto.SetUserRolesQuery,
    @Body() request: dto.SetUserRolesRequest,
  ): Promise<dto.SetUserRolesResponse> {
    await this.rolesService.setRolesForUser(query.userId, request.roleIds);
    return new dto.SetUserRolesResponse();
  }
}
