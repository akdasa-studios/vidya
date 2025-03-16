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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserId, UserWithPermissions } from '@vidya/api/auth/decorators';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import { UserPermissions } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { SchoolExistsPipe } from '@vidya/api/edu/pipes';
import { SchoolCreationService, SchoolsService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/utils';
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
@UseGuards(AuthenticatedUser)
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
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.GetSchoolResponse> {
    permissions.check(['schools:read']);
    const school = await this.schoolsService
      .scopedBy({ permissions })
      .findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with id ${id} not found`);
    }
    return this.mapper.map(school, entities.School, dto.GetSchoolResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET /edu/schools                             */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.schools.find())
  async getMany(
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.GetSchoolsResponse> {
    permissions.check(['schools:read']);
    const schools = await this.schoolsService
      .scopedBy({ permissions })
      .findAll({});
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
    @UserId() userId: string,
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.CreateSchoolResponse> {
    permissions.check(['schools:create']);
    const entity = await this.schoolCreationService.createNewSchool(userId, {
      name: request.name,
    });
    return this.mapper.map(entity, entities.School, dto.CreateSchoolResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                            PATCH /edu/schools/:id                          */
  /* -------------------------------------------------------------------------- */

  @Crud.UpdateOne(Routes().edu.schools.update(':id'))
  async updateOne(
    @Param('id', new ParseUUIDPipe(), SchoolExistsPipe) id: string,
    @Body() request: dto.UpdateSchoolRequest,
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.UpdateSchoolResponse> {
    permissions.check(['schools:update']);
    let school = await this.schoolsService
      .scopedBy({ permissions })
      .findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with id ${id} not found`);
    }

    // User has permission to update school. Proceed with update.
    school = await this.schoolsService.updateOneBy(
      { id },
      this.mapper.map(request, dto.UpdateSchoolRequest, entities.School),
    );
    return this.mapper.map(school, entities.School, dto.UpdateSchoolResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                            DELETE /edu/schools/:id                         */
  /* -------------------------------------------------------------------------- */

  @Crud.DeleteOne(Routes().edu.schools.delete(':id'))
  async deleteOne(
    @Param('id', new ParseUUIDPipe(), SchoolExistsPipe) id: string,
    @UserWithPermissions() permissions: UserPermissions,
  ): Promise<dto.DeleteSchoolResponse> {
    // Check if user has permission to delete school
    permissions.check(['schools:delete']);
    const school = await this.schoolsService
      .scopedBy({ permissions })
      .findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with id ${id} not found`);
    }

    // User has permission to delete school. Proceed with deletion.
    await this.schoolsService.deleteOneBy({ id });
    return new dto.DeleteSchoolResponse({ success: true });
  }
}
