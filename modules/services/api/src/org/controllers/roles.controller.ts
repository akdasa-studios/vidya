import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as dto from '@vidya/api/org/dto';
import { RolesService } from '@vidya/api/org/services';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiTags('Roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                 GET /roles                                 */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().org.roles.getList())
  @ApiOperation({
    summary: 'Returns a list of roles',
    operationId: 'roles::getList',
  })
  @ApiOkResponse({
    type: dto.GetRolesListResponse,
    description: 'Get a list of roles.',
  })
  async getRolesList(): Promise<dto.GetRolesListResponse> {
    const roles = await this.rolesService.findAll();
    return new dto.GetRolesListResponse({
      roles: this.mapper.mapArray(roles, entities.Role, dto.Role),
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                 POST /roles                                */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().org.roles.create())
  @ApiOperation({
    summary: 'Create a new role',
    operationId: 'roles::create',
  })
  @ApiOkResponse({
    type: dto.CreateRoleResponse,
    description: 'Creates a new role.',
  })
  async createRole(
    @Body() request: dto.CreateRoleRequest,
  ): Promise<dto.CreateRoleResponse> {
    const entity = await this.rolesService.create(
      this.mapper.map(request, dto.CreateRoleRequest, entities.Role),
    );
    return new dto.CreateRoleResponse(entity.id);
  }

  /* -------------------------------------------------------------------------- */
  /*                              PATCH /roles/:id                              */
  /* -------------------------------------------------------------------------- */

  @Patch(Routes().org.roles.update())
  @ApiOperation({
    summary: 'Update a role',
    operationId: 'roles::update',
  })
  @ApiOkResponse({
    type: dto.UpdateRoleResponse,
    description: 'Updates a role.',
  })
  async updateRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: dto.UpdateRoleRequest,
  ): Promise<dto.UpdateRoleResponse> {
    await this.rolesService.updateOneBy(
      { id },
      this.mapper.map(request, dto.UpdateRoleRequest, entities.Role),
    );
    return new dto.UpdateRoleResponse();
  }
}
