import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  RequirePermissions,
  UserWithPermissions,
} from '@vidya/api/auth/decorators';
import { UserPermissions } from '@vidya/api/auth/utils'
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import * as dto from '@vidya/api/org/dto';
import { RoleExistsPipe } from '@vidya/api/org/pipes';
import { RolesService } from '@vidya/api/org/services';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiTags('Users and Roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                 GET /roles                                 */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().org.roles.find())
  @UseGuards(AuthenticatedUser)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Returns a list of roles',
    operationId: 'roles::find',
  })
  @ApiOkResponse({
    type: dto.GetRoleSummariesListResponse,
    description: 'Get a list of roles.',
  })
  async getRolesList(
    @Query() query: dto.GetRoleSummariesListQuery,
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.GetRoleSummariesListResponse> {
    const roles = await this.rolesService.findPermittedBy(permissions, {
      organizationId: query.organizationId,
      schoolId: query.schoolId,
    });
    return new dto.GetRoleSummariesListResponse({
      roles: this.mapper.mapArray(roles, entities.Role, dto.RoleSummary),
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET /roles/:id                               */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().org.roles.get(':id'))
  @UseGuards(AuthenticatedUser)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Returns a role',
    operationId: 'roles::get',
  })
  @ApiOkResponse({
    type: dto.GetRoleResponse,
    description: 'Get a role.',
  })
  async getRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.GetRoleResponse> {
    const roles = await this.rolesService.findPermittedBy(permissions, { id });
    if (roles.length === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return this.mapper.map(roles[0], entities.Role, dto.Role);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 POST /roles                                */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().org.roles.create())
  // @UseGuards(AuthenticatedUser)
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

  @Patch(Routes().org.roles.update(':id'))
  // @RequirePermissions('roles:read')
  // @UseGuards(AuthenticatedUser)
  @ApiOperation({
    summary: 'Update a role',
    operationId: 'roles::update',
  })
  @ApiOkResponse({
    type: dto.UpdateRoleResponse,
    description: 'Updates a role.',
  })
  async updateRole(
    @Param('id', new ParseUUIDPipe(), RoleExistsPipe) id: string,
    @Body() request: dto.UpdateRoleRequest,
  ): Promise<dto.UpdateRoleResponse> {
    await this.rolesService.updateOneBy(
      { id },
      this.mapper.map(request, dto.UpdateRoleRequest, entities.Role),
    );
    return new dto.UpdateRoleResponse(id);
  }

  /* -------------------------------------------------------------------------- */
  /*                              DELETE /roles/:id                             */
  /* -------------------------------------------------------------------------- */

  @Delete(Routes().org.roles.delete(':id'))
  @RequirePermissions('roles:read')
  // @UseGuards(AuthenticatedUser)
  @ApiOperation({
    summary: 'Delete a role',
    operationId: 'roles::delete',
  })
  @ApiOkResponse({
    type: dto.DeleteRoleResponse,
    description: 'Deletes a role.',
  })
  async deleteRole(
    @Param('id', new ParseUUIDPipe(), RoleExistsPipe) id: string,
  ): Promise<dto.DeleteRoleResponse> {
    await this.rolesService.deleteOneBy({ id });
    return new dto.DeleteRoleResponse(id);
  }
}
