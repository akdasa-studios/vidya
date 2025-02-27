import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
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

  @Get(Routes().org.find())
  @ApiOperation({
    summary: 'Returns a list of organizations',
    operationId: 'organizations::find',
  })
  @ApiOkResponse({
    type: GetOrganizationsResponse,
    description: 'Get a list of organizations.',
  })
  async getOrganizations(): Promise<GetOrganizationsResponse> {
    const orgs = await this.organizationsService.findAllBy({});
    return {
      items: this.mapper.mapArray(
        orgs,
        entities.Organization,
        dto.Organization,
      ),
    };
  }

  @Get(Routes().org.get(':id'))
  async getOrganization(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<dto.GetOrganizationResponse> {
    const org = await this.organizationsService.findOneBy({ id });
    return this.mapper.map(org, entities.Organization, dto.Organization);
  }

  @Post(Routes().org.create())
  async createOrganization(
    @Body() request: dto.CreateOrganizationRequest,
  ): Promise<dto.CreateOrganizationResponse> {
    const entity = await this.organizationsService.create({
      name: request.name,
    });
    return this.mapper.map(
      entity,
      entities.Organization,
      dto.CreateOrganizationResponse,
    );
  }

  @Patch(Routes().org.update(':id'))
  async updateOrganization(
    @Body() request: dto.UpdateOrganizationRequest,
    @Param('id', new ParseUUIDPipe(), OrganizationExistsPipe) id: string,
  ): Promise<dto.UpdateOrganizationResponse> {
    const org = await this.organizationsService.updateOneBy({ id }, request);
    return this.mapper.map(
      org,
      entities.Organization,
      dto.UpdateOrganizationResponse,
    );
  }

  @Delete(Routes().org.delete(':id'))
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
  async deleteOrganization(
    @Param('id', new ParseUUIDPipe(), OrganizationExistsPipe) id: string,
  ): Promise<dto.DeleteOrganizationResponse> {
    await this.organizationsService.deleteOneBy({ id });
    return { success: true };
  }
}
