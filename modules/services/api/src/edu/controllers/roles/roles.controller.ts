import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authentication } from '@vidya/api/auth/decorators';
import { AuthenticatedUserGuard } from '@vidya/api/auth/guards';
import { UserAuthentication } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { RoleExistsPipe } from '@vidya/api/edu/pipes';
import { RolesService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/utils';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

const Crud = CrudDecorators({
  entityName: 'Role',
  getOneResponseDto: dto.GetRoleResponse,
  getManyResponseDto: dto.GetRolesResponse,
  createOneResponseDto: dto.CreateRoleResponse,
  updateOneResponseDto: dto.UpdateRoleResponse,
  deleteOneResponseDto: dto.DeleteRoleResponse,
});

@Controller()
@ApiTags('🕵️‍♂️ Education :: Roles')
@ApiBearerAuth()
@UseGuards(AuthenticatedUserGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  /* -------------------------------------------------------------------------- */
  /*                             GET /edu/roles/:id                             */
  /* -------------------------------------------------------------------------- */

  @Crud.GetOne(Routes().edu.roles.get(':id'))
  async getOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.GetRoleResponse> {
    // Check if user has permission to read roles
    if (!auth.permissions.has(['roles:read'])) {
      throw new ForbiddenException('User does not have permission');
    }

    // Get role by Id with user permissions scope
    const role = await this.rolesService
      .scopedBy({ permissions: auth.permissions })
      .findOne({ where: { id } });

    // No role found with the given Id
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    // Return role details
    return this.mapper.map(role, entities.Role, dto.RoleDetails);
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET /edu/roles                               */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.roles.find())
  async getMany(
    @Query() query: dto.GetRoleSummariesListQuery,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.GetRolesResponse> {
    // Check if user has permission to read roles
    if (!auth.permissions.has(['roles:read'])) {
      throw new ForbiddenException('User does not have permission');
    }

    // Get roles
    const roles = await this.rolesService
      .scopedBy({ permissions: auth.permissions })
      .findAll({
        where: {
          schoolId: query.schoolId,
        },
      });

    // Return role summaries
    return new dto.GetRolesResponse({
      items: this.mapper.mapArray(roles, entities.Role, dto.RoleSummary),
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                               POST /edu/roles                              */
  /* -------------------------------------------------------------------------- */

  @Crud.CreateOne(Routes().edu.roles.create())
  async createOne(
    @Body() request: dto.CreateRoleRequest,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.CreateRoleResponse> {
    // Check if user has permission to create roles
    if (
      !auth.permissions.has(['roles:create'], {
        schoolId: request.schoolId,
      })
    ) {
      throw new ForbiddenException('User does not have permission');
    }

    // Create role
    const entity = await this.rolesService.create(
      this.mapper.map(request, dto.CreateRoleRequest, entities.Role),
    );

    // Return created role details
    return this.mapper.map(entity, entities.Role, dto.CreateRoleResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                            PATCH /edu/roles/:id                            */
  /* -------------------------------------------------------------------------- */

  @Crud.UpdateOne(Routes().edu.roles.update(':id'))
  async updateOne(
    @Param('id', new ParseUUIDPipe(), RoleExistsPipe) id: string,
    @Body() request: dto.UpdateRoleRequest,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.UpdateRoleResponse> {
    // Check if user has permission to update role
    let role = await this.rolesService.findOneBy({ id });
    if (
      !auth.permissions.has(['roles:update'], {
        schoolId: role.schoolId,
      })
    ) {
      throw new ForbiddenException('User does not have permission');
    }

    // Update role
    role = await this.rolesService.updateOneBy(
      { id },
      this.mapper.map(request, dto.UpdateRoleRequest, entities.Role),
    );

    // Return updated role details
    return this.mapper.map(role, entities.Role, dto.UpdateRoleResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                            DELETE /edu/roles/:id                           */
  /* -------------------------------------------------------------------------- */

  @Crud.DeleteOne(Routes().edu.roles.delete(':id'))
  async deleteOne(
    @Param('id', new ParseUUIDPipe(), RoleExistsPipe) id: string,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.DeleteRoleResponse> {
    // Check if user has permission to delete role
    const role = await this.rolesService.findOneBy({ id });
    if (
      !auth.permissions.has(['roles:delete'], {
        schoolId: role.schoolId,
      })
    ) {
      throw new ForbiddenException('User does not have permission');
    }

    // Delete role
    await this.rolesService.deleteOneBy({ id });

    // Return success response
    return new dto.DeleteRoleResponse({ success: true });
  }
}
