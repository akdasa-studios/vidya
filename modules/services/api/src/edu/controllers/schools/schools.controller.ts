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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authentication } from '@vidya/api/auth/decorators';
import { AuthenticatedUserGuard } from '@vidya/api/auth/guards';
import { UserAuthentication } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { SchoolExistsPipe } from '@vidya/api/edu/pipes';
import { SchoolCreationService, SchoolsService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/shared/decorators';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

const Crud = CrudDecorators({
  entityName: 'School',
  getOneResponseDto: dto.GetSchoolResponse,
  getManyResponseDto: dto.GetSchoolsResponse,
  createOneResponseDto: dto.CreateSchoolResponse,
  updateOneResponseDto: dto.UpdateSchoolResponse,
  deleteOneResponseDto: dto.DeleteSchoolResponse,
});

@Controller()
@ApiTags('🏫 Education :: Schools')
@ApiBearerAuth()
@UseGuards(AuthenticatedUserGuard)
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly schoolCreationService: SchoolCreationService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  /* -------------------------------------------------------------------------- */
  /*                             GET /edu/schools/:id                           */
  /* -------------------------------------------------------------------------- */

  @Crud.GetOne(Routes().edu.schools.get(':id'))
  async getOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.GetSchoolResponse> {
    // Check if user has permission to read schools
    if (!auth.permissions.has(['schools:read'])) {
      throw new ForbiddenException('User does not have permission');
    }

    // Get school by Id with user permissions scope
    const school = await this.schoolsService
      .scopedBy({ permissions: auth.permissions })
      .findOne({ where: { id } });

    // No school found with the given Id
    if (!school) {
      throw new NotFoundException(`School with id ${id} not found`);
    }

    // Return school response
    return this.mapper.map(school, entities.School, dto.GetSchoolResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET /edu/schools                             */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.schools.find())
  async getMany(
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.GetSchoolsResponse> {
    // Check if user has permission to read schools
    if (!auth.permissions.has(['schools:read'])) {
      throw new ForbiddenException('User does not have permission');
    }

    // Get schools with user permissions scope
    const schools = await this.schoolsService
      .scopedBy({ permissions: auth.permissions })
      .findAll({});

    // Return schools response
    return new dto.GetSchoolsResponse({
      items: this.mapper.mapArray(schools, entities.School, dto.SchoolSummary),
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                               POST /edu/schools                            */
  /* -------------------------------------------------------------------------- */

  @Crud.CreateOne(Routes().edu.schools.create())
  async createOne(
    @Body() request: dto.CreateSchoolRequest,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.CreateSchoolResponse> {
    // Check if user has permission to create schools
    if (!auth.permissions.has(['schools:create'])) {
      throw new ForbiddenException('User does not have permission');
    }

    // Create new school
    const entity = await this.schoolCreationService.createNewSchool(
      auth.userId,
      {
        name: request.name,
      },
    );

    // Return created school response
    return this.mapper.map(entity, entities.School, dto.CreateSchoolResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                            PATCH /edu/schools/:id                          */
  /* -------------------------------------------------------------------------- */

  @Crud.UpdateOne(Routes().edu.schools.update(':id'))
  async updateOne(
    @Param('id', new ParseUUIDPipe(), SchoolExistsPipe) id: string,
    @Body() request: dto.UpdateSchoolRequest,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.UpdateSchoolResponse> {
    // Check if user has permission to update school
    if (!auth.permissions.has(['schools:update'])) {
      throw new ForbiddenException('User does not have permission');
    }

    // Get school by Id with user permissions scope
    let school = await this.schoolsService
      .scopedBy({ permissions: auth.permissions })
      .findOne({ where: { id } });

    // No school found with the given Id
    if (!school) {
      throw new NotFoundException(`School with id ${id} not found`);
    }

    // Update school
    school = await this.schoolsService.updateOneBy(
      { id },
      this.mapper.map(request, dto.UpdateSchoolRequest, entities.School),
    );

    // Return updated school response
    return this.mapper.map(school, entities.School, dto.UpdateSchoolResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                            DELETE /edu/schools/:id                         */
  /* -------------------------------------------------------------------------- */

  @Crud.DeleteOne(Routes().edu.schools.delete(':id'))
  async deleteOne(
    @Param('id', new ParseUUIDPipe(), SchoolExistsPipe) id: string,
    @Authentication() auth: UserAuthentication,
  ): Promise<dto.DeleteSchoolResponse> {
    // Check if user has permission to delete school
    if (!auth.permissions.has(['schools:delete'])) {
      throw new ForbiddenException('User does not have permission');
    }

    // Get school by Id with user permissions scope
    const school = await this.schoolsService
      .scopedBy({ permissions: auth.permissions })
      .findOne({ where: { id } });

    // No school found with the given Id
    if (!school) {
      throw new NotFoundException(`School with id ${id} not found`);
    }

    // Delete school
    await this.schoolsService.deleteOneBy({ id });

    // Return success response
    return new dto.DeleteSchoolResponse({ success: true });
  }
}
