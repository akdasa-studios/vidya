import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
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
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

const Crud = CrudDecorators({
  entityName: 'Organization',
  getOneResponseDto: dto.GetOrganizationResponse,
  getManyResponseDto: dto.GetOrganizationsResponse,
  updateOneResponseDto: dto.UpdateOrganizationResponse,
  deleteOneResponseDto: dto.DeleteOrganizationResponse,
});

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

  @Crud.GetOne(Routes().edu.org.get(':id'))
  async getOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.GetOrganizationResponse> {
    const orgs = await this.organizationsService
      .scopedBy({ permissions: userPermissions })
      .findAll({ where: { id } });
    if (orgs.length === 0) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return this.mapper.map(
      orgs[0],
      entities.Organization,
      dto.GetOrganizationResponse,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                           GET /edu/organizations                           */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.org.find())
  async getMany(
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<GetOrganizationsResponse> {
    const orgs = await this.organizationsService
      .scopedBy({ permissions: userPermissions })
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
  /*                         PATCH /edu/organizations/:id                       */
  /* -------------------------------------------------------------------------- */

  @Crud.UpdateOne(Routes().edu.org.update(':id'))
  async updateOne(
    @Body() request: dto.UpdateOrganizationRequest,
    @Param('id', new ParseUUIDPipe(), OrganizationExistsPipe) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.UpdateOrganizationResponse> {
    userPermissions.check(['orgs:update'], { organizationId: id });
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

  @Crud.DeleteOne(Routes().edu.org.delete(':id'))
  async deleteOne(
    @Param('id', new ParseUUIDPipe(), OrganizationExistsPipe) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.DeleteOrganizationResponse> {
    userPermissions.check(['orgs:delete'], { organizationId: id });
    await this.organizationsService.deleteOneBy({ id });
    return new dto.DeleteOrganizationResponse({ success: true });
  }
}
