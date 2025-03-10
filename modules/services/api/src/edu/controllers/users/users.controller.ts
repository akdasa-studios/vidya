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
import { UserWithPermissions } from '@vidya/api/auth/decorators';
import { AuthenticatedUser } from '@vidya/api/auth/guards';
import { UserPermissions } from '@vidya/api/auth/utils';
import * as dto from '@vidya/api/edu/dto';
import { GetUsersResponse } from '@vidya/api/edu/dto';
import { UserExistsPipe } from '@vidya/api/edu/pipes';
import { RolesService, UsersService } from '@vidya/api/edu/services';
import { CrudDecorators } from '@vidya/api/utils';
import * as entities from '@vidya/entities';
import { Routes } from '@vidya/protocol';

const Crud = CrudDecorators({
  entityName: 'User',
  getOneResponseDto: dto.GetUserResponse,
  getManyResponseDto: dto.GetUsersResponse,
  updateOneResponseDto: dto.UpdateUserResponse,
  deleteOneResponseDto: dto.DeleteUserResponse,
});

@Controller()
@ApiBearerAuth()
@ApiTags('Users')
@UseGuards(AuthenticatedUser)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                             GET /edu/users/:id                             */
  /* -------------------------------------------------------------------------- */

  @Crud.GetOne(Routes().edu.user(':id').get())
  async getOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.GetUserResponse> {
    userPermissions.check(['users:read']);
    const users = await this.usersService
      .scopedBy({ permissions: userPermissions })
      .findAll({ where: { id } });
    if (users.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.mapper.map(users[0], entities.User, dto.GetUserResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET /edu/users                               */
  /* -------------------------------------------------------------------------- */

  @Crud.GetMany(Routes().edu.user(':id').find())
  async getMany(
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<GetUsersResponse> {
    userPermissions.check(['users:read']);
    const users = await this.usersService
      .scopedBy({ permissions: userPermissions })
      .findAll({});
    return new dto.GetUsersResponse({
      items: this.mapper.mapArray(users, entities.User, dto.UserSummary),
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                           PATCH /edu/users/:id                             */
  /* -------------------------------------------------------------------------- */

  @Crud.UpdateOne(Routes().edu.user(':id').update())
  async updateOne(
    @Body() request: dto.UpdateUserRequest,
    @Param('id', new ParseUUIDPipe(), UserExistsPipe) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.UpdateUserResponse> {
    // TODO user can update himself without any permission
    const roles = await this.rolesService.getRolesOfUser(id);
    const scopes = roles.map((role) => ({
      schoolId: role.schoolId,
    }));

    userPermissions.check(['users:update'], scopes);

    const user = await this.usersService.updateOneBy({ id }, request);
    return this.mapper.map(user, entities.User, dto.UpdateUserResponse);
  }

  /* -------------------------------------------------------------------------- */
  /*                          DELETE /edu/users/:id                             */
  /* -------------------------------------------------------------------------- */

  @Crud.DeleteOne(Routes().edu.user(':id').delete())
  async deleteOne(
    @Param('id', new ParseUUIDPipe(), UserExistsPipe) id: string,
    @UserWithPermissions() userPermissions: UserPermissions,
  ): Promise<dto.DeleteUserResponse> {
    // userPermissions.check(['users:delete'], { userId: id });
    await this.usersService.deleteOneBy({ id });
    return new dto.DeleteUserResponse({ success: true });
  }
}
