import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
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
    // type: dto.GetRoleSummariesListResponse,
    description: 'Get list of assigned roles to a user.',
  })
  async getRolesList(): Promise<any> {
    return [];
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
    // type: dto.CreateRoleResponse,
    description: 'Assigns an existing role to a user.',
  })
  async createRole(@Body() request: any): Promise<any> {
    return {};
  }

  /* -------------------------------------------------------------------------- */
  /*                   DELETE /org/users/:userId/roles/:roleId                  */
  /* -------------------------------------------------------------------------- */

  @Delete(Routes().org.userRoles.delete(':userId', ':roleId'))
  @ApiOperation({
    summary: 'Remove a role from a user',
    operationId: 'userRoles::delete',
  })
  @ApiOkResponse({
    // type: dto.DeleteRoleResponse,
    description: 'Remove an existing role from a user.',
  })
  async deleteRole(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ): Promise<any> {
    return {};
  }
}
