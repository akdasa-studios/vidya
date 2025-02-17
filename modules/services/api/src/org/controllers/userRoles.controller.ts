import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as dto from '@vidya/api/org/dto';
import { RolesService } from '@vidya/api/org/services';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiTags('Users and Roles')
export class UserRolesController {
  constructor(
    private readonly rolesService: RolesService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                        GET /org/users/:userId/roles                        */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().org.userRoles.all(':userId'))
  @ApiOperation({
    summary: 'Get a list of roles of a user',
    operationId: 'userRoles::all',
  })
  @ApiOkResponse({
    type: dto.GetUserRolesListResponse,
    description: 'Get list of assigned roles to a user.',
  })
  async getRolesList(
    @Query() request: dto.GetUserRolesListRequest,
  ): Promise<dto.GetUserRolesListResponse> {
    const roles = await this.rolesService.getRolesOfUser(request.userId);
    const userRoles = this.mapper.mapArray(roles, entities.Role, dto.UserRole);
    return new dto.GetUserRolesListResponse(userRoles);
  }

  /* -------------------------------------------------------------------------- */
  /*                        POST /org/users/:userId/roles                       */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().org.userRoles.create(':userId'))
  @ApiOperation({
    summary: 'Assign a role to a user',
    operationId: 'userRoles::create',
  })
  @ApiOkResponse({
    type: dto.SetUserRolesResponse,
    description: 'Assigns an existing role to a user.',
  })
  async createRole(
    @Query() query: dto.SetUserRolesQuery,
    @Body() request: dto.SetUserRolesRequest,
  ): Promise<dto.SetUserRolesResponse> {
    await this.rolesService.setRolesForUser(query.userId, request.roleIds);
    return new dto.SetUserRolesResponse();
  }
}
