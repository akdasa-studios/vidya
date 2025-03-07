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
import { UserWithPermissions } from '@vidya/api/auth/decorators';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import { UserPermissions } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { RoleExistsPipe } from '@vidya/api/edu/pipes';
import { RolesService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/utils';
import * as domain from '@vidya/domain';
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
@ApiTags('Roles')
@ApiBearerAuth()
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
    return this.mapper.map(roles[0], entities.Role, dto.RoleDetails);
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET /edu/roles                               */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.roles.find())
  async getMany(
    @Query() query: dto.GetRoleSummariesListQuery,
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.GetRolesResponse> {
    const roles = await this.rolesService.findPermittedBy(permissions, {
      organizationId: query.organizationId,
      schoolId: query.schoolId,
    });
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
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.CreateRoleResponse> {
    this.checkUserPermissions(
      userPermissions,
      ['roles:create'],
      request.organizationId,
      request.schoolId,
    );

    const entity = await this.rolesService.create(
      this.mapper.map(request, dto.CreateRoleRequest, entities.Role),
    );

    return this.mapper.map(entity, entities.Role, dto.CreateRoleResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                            PATCH /edu/roles/:id                            */
  /* -------------------------------------------------------------------------- */

  @Crud.UpdateOne(Routes().edu.roles.update(':id'))
  async updateOne(
    @Param('id', new ParseUUIDPipe(), RoleExistsPipe) id: string,
    @Body() request: dto.UpdateRoleRequest,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.UpdateRoleResponse> {
    // Check if user has permission to update role
    let role = await this.rolesService.findOneBy({ id });
    this.checkUserPermissions(
      userPermissions,
      ['roles:update'],
      role.organizationId,
      role.schoolId,
    );

    // User has permission to update role. Proceed with update.
    role = await this.rolesService.updateOneBy(
      { id },
      this.mapper.map(request, dto.UpdateRoleRequest, entities.Role),
    );
    return this.mapper.map(role, entities.Role, dto.UpdateRoleResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                            DELETE /edu/roles/:id                           */
  /* -------------------------------------------------------------------------- */

  @Crud.DeleteOne(Routes().edu.roles.delete(':id'))
  async deleteOne(
    @Param('id', new ParseUUIDPipe(), RoleExistsPipe) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.DeleteRoleResponse> {
    // Check if user has permission to delete role
    const role = await this.rolesService.findOneBy({ id });
    this.checkUserPermissions(
      userPermissions,
      ['roles:delete'],
      role.organizationId,
      role.schoolId,
    );

    // User has permission to delete role. Proceed with deletion.
    await this.rolesService.deleteOneBy({ id });
    return new dto.DeleteRoleResponse({ success: true });
  }

  /* -------------------------------------------------------------------------- */
  /*                               Private methods                              */
  /* -------------------------------------------------------------------------- */

  // TODO !HIGH Extract to base ProtectedCrud controller
  private checkUserPermissions(
    userPermissions: UserPermissions,
    requiredPermissions: domain.PermissionKey[],
    organizationId: string,
    schoolId?: string,
  ) {
    // Check if user has permission to create roles
    // on the organization level
    const permittedOnOrgLevel = userPermissions
      .getPermittedOrganizations(requiredPermissions)
      .includes(organizationId);

    // Check if user has permission to create roles
    // on the school level
    const permittedOnSchoolLevel = schoolId
      ? userPermissions
          .getPermittedSchools(requiredPermissions)
          .includes(schoolId)
      : true;

    // If user does not have permission to create roles
    // on either the organization or school level, throw an error
    // indicating that the user does not have permission
    if (!permittedOnOrgLevel || !permittedOnSchoolLevel) {
      throw new ForbiddenException('User does not have permission');
    }
  }
}
