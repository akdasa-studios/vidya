import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserWithPermissions } from '@vidya/api/auth/decorators';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import { UserPermissions } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { GetOrganizationsResponse } from '@vidya/api/edu/dto';
import { OrganizationExistsPipe } from '@vidya/api/edu/pipes';
import { OrganizationsService } from '@vidya/api/edu/services';
import * as domain from '@vidya/domain';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiBearerAuth()
@UseGuards(AuthenticatedUser)
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
})
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                           GET /edu/organizations                           */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().edu.org.find())
  @ApiOperation({
    summary: 'Returns a list of organizations',
    description: 'Returns list of organizations that the user has access to.',
    operationId: 'organizations::find',
  })
  @ApiOkResponse({
    type: GetOrganizationsResponse,
    description: 'List of organizations.',
  })
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
  /*                         GET /edu/organizations/:id                         */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().edu.org.get(':id'))
  @ApiOperation({
    summary: 'Get an organization by Id',
    description: 'Returns an organization by Id if the user has access to it.',
    operationId: 'organizations::get',
  })
  @ApiOkResponse({
    type: dto.GetOrganizationResponse,
    description: 'Organization details.',
  })
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
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
  /*                          POST /edu/organizations                           */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().edu.org.create())
  @ApiOperation({
    summary: 'Create a new organization',
    operationId: 'organizations::create',
  })
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

  @Patch(Routes().edu.org.update(':id'))
  @ApiOperation({
    summary: 'Update an organization',
    operationId: 'organizations::update',
  })
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
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

  @Delete(Routes().edu.org.delete(':id'))
  @ApiOperation({
    summary: 'Delete an organization',
    operationId: 'organizations::delete',
  })
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
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
