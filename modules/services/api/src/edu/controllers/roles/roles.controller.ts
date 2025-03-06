import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserWithPermissions } from '@vidya/api/auth/decorators';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import { UserPermissions } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { RoleExistsPipe } from '@vidya/api/edu/pipes';
import { RolesService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/utils';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

const Crud = CrudDecorators({
  entityName: 'Role',
  getOneResponseDto: dto.GetRoleResponse,
  getManyResponseDto: dto.GetRoleSummariesListResponse,
  createOneResponseDto: dto.CreateRoleResponse,
  updateOneResponseDto: dto.UpdateRoleResponse,
  deleteOneResponseDto: dto.DeleteRoleResponse,
});

@Controller()
@ApiTags('Roles')
@UseGuards(AuthenticatedUser)
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
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.GetRoleResponse> {
    const roles = await this.rolesService.findPermittedBy(permissions, { id });
    if (roles.length === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return this.mapper.map(roles[0], entities.Role, dto.Role);
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET /edu/roles                               */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.roles.find())
  async getMany(
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
  /*                               POST /edu/roles                              */
  /* -------------------------------------------------------------------------- */

  @Crud.CreateOne(Routes().edu.roles.create())
  async createOne(
    @Body() request: dto.CreateRoleRequest,
  ): Promise<dto.CreateRoleResponse> {
    const entity = await this.rolesService.create(
      this.mapper.map(request, dto.CreateRoleRequest, entities.Role),
    );
    return new dto.CreateRoleResponse(entity.id);
  }

  /* -------------------------------------------------------------------------- */
  /*                            PATCH /edu/roles/:id                            */
  /* -------------------------------------------------------------------------- */

  @Crud.UpdateOne(Routes().edu.roles.update(':id'))
  async updateOne(
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
  /*                            DELETE /edu/roles/:id                           */
  /* -------------------------------------------------------------------------- */

  @Crud.DeleteOne(Routes().edu.roles.delete(':id'))
  async deleteOne(
    @Param('id', new ParseUUIDPipe(), RoleExistsPipe) id: string,
  ): Promise<dto.DeleteRoleResponse> {
    await this.rolesService.deleteOneBy({ id });
    return new dto.DeleteRoleResponse(id);
  }
}
