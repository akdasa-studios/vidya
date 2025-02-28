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
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserWithPermissions } from '@vidya/api/auth/decorators';
import { UserPermissions } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/org/dto';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

import { GetOrganizationsResponse } from '../dto/organizations.dto';
import { OrganizationExistsPipe } from '../pipes';
import { OrganizationsService } from '../services/organizations.service';

@Controller()
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                  GET /orgs                                 */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().org.find())
  @ApiOperation({
    summary: 'Returns a list of organizations',
    operationId: 'organizations::find',
  })
  @ApiOkResponse({
    type: GetOrganizationsResponse,
    description: 'Get a list of organizations.',
  })
  async getOrganizations(
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<GetOrganizationsResponse> {
    const orgs =
      await this.organizationsService.findPermittedOrganizationsBy(
        userPermissions,
      );
    return {
      items: this.mapper.mapArray(
        orgs,
        entities.Organization,
        dto.Organization,
      ),
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                GET /orgs/:id                               */
  /* -------------------------------------------------------------------------- */

  @Get(Routes().org.get(':id'))
  async getOrganization(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.GetOrganizationResponse> {
    const orgs = await this.organizationsService.findPermittedOrganizationsBy(
      userPermissions,
      { id },
    );
    if (orgs.length === 0) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return this.mapper.map(orgs[0], entities.Organization, dto.Organization);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 POST /orgs                                 */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().org.create())
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
  /*                               PATCH /orgs/:id                              */
  /* -------------------------------------------------------------------------- */

  @Patch(Routes().org.update(':id'))
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
  /*                              DELETE /orgs/:id                              */
  /* -------------------------------------------------------------------------- */

  @Delete(Routes().org.delete(':id'))
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
    requiredPermissions: string[],
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
