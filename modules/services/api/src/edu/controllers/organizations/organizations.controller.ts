import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserWithPermissions } from '@vidya/api/auth/decorators';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import { UserPermissions } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { GetOrganizationsResponse } from '@vidya/api/edu/dto';
import { OrganizationExistsPipe } from '@vidya/api/edu/pipes';
import { OrganizationsService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/utils';
import * as domain from '@vidya/domain';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

const OrganizationsCrudDecorators = CrudDecorators(
  'Organization',
  dto.GetOrganizationResponse,
  dto.GetOrganizationsResponse,
  dto.CreateOrganizationResponse,
  dto.UpdateOrganizationResponse,
  dto.DeleteOrganizationResponse,
);

@Controller()
@ApiBearerAuth()
@UseGuards(AuthenticatedUser)
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                         GET /edu/organizations/:id                         */
  /* -------------------------------------------------------------------------- */

  @OrganizationsCrudDecorators.GetOne(Routes().edu.org.get(':id'))
  async getOrganization(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.GetOrganizationResponse> {
    const orgs = await this.organizationsService
      .scopedBy(userPermissions)
      .findAll({ where: { id } });
    if (orgs.length === 0) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return this.mapper.map(
      orgs[0],
      entities.Organization,
      dto.OrganizationDetails,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                           GET /edu/organizations                           */
  /* -------------------------------------------------------------------------- */

  @OrganizationsCrudDecorators.GetMany(Routes().edu.org.find())
  async getOrganizations(
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<GetOrganizationsResponse> {
    const orgs = await this.organizationsService
      .scopedBy(userPermissions)
      .findAll({});
    return {
      items: this.mapper.mapArray(
        orgs,
        entities.Organization,
        dto.OrganizationSummary,
      ),
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                          POST /edu/organizations                           */
  /* -------------------------------------------------------------------------- */

  @OrganizationsCrudDecorators.CreateOne(Routes().edu.org.create())
  async createOrganization(
    @Body() request: dto.CreateOrganizationRequest,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.CreateOrganizationResponse> {
    if (!userPermissions.hasPermissions(['orgs:create'])) {
      throw new ForbiddenException(
        'User does not have permission to create organizations',
      );
    }

    const entity = await this.organizationsService.create({
      name: request.name,
    });
    return this.mapper.map(
      entity,
      entities.Organization,
      dto.CreateOrganizationResponse,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                         PATCH /edu/organizations/:id                       */
  /* -------------------------------------------------------------------------- */

  @OrganizationsCrudDecorators.UpdateOne(Routes().edu.org.update(':id'))
  async updateOrganization(
    @Body() request: dto.UpdateOrganizationRequest,
    @Param('id', new ParseUUIDPipe(), OrganizationExistsPipe) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.UpdateOrganizationResponse> {
    this.checkUserPermissions(userPermissions, ['orgs:update'], id);
    const org = await this.organizationsService.updateOneBy({ id }, request);
    return this.mapper.map(
      org,
      entities.Organization,
      dto.UpdateOrganizationResponse,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                        DELETE /edu/organizations/:id                       */
  /* -------------------------------------------------------------------------- */

  @OrganizationsCrudDecorators.DeleteOne(Routes().edu.org.delete(':id'))
  async deleteOrganization(
    @Param('id', new ParseUUIDPipe(), OrganizationExistsPipe) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.DeleteOrganizationResponse> {
    this.checkUserPermissions(userPermissions, ['orgs:delete'], id);
    await this.organizationsService.deleteOneBy({ id });
    return { success: true };
  }

  /* -------------------------------------------------------------------------- */
  /*                               Private methods                              */
  /* -------------------------------------------------------------------------- */

  private checkUserPermissions(
    userPermissions: UserPermissions,
    requiredPermissions: domain.PermissionKey[],
    id: string,
  ) {
    if (
      !userPermissions
        .getPermittedOrganizations(requiredPermissions)
        .includes(id)
    ) {
      throw new ForbiddenException('User does not have permission');
    }
  }
}
