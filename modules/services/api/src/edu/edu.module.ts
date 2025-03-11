import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevokedTokensService } from '@vidya/api/auth/services';
import { AuthUsersService } from '@vidya/api/auth/services';
import {
  RolesService,
  SchoolsService,
  UsersService,
} from '@vidya/api/edu/services';
import { School, User, UserRole } from '@vidya/entities';
import { Role } from '@vidya/entities';

import { RolesController, UserRolesController } from './controllers';
import { RolesMappingProfile } from './mappers/roles.mapper';
import { IsRoleExistConstraint, IsUserExistConstraint } from './validations';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, School])],
  controllers: [RolesController, UserRolesController],
  providers: [
    AuthUsersService,
    RolesService,
    UsersService,
    SchoolsService,
    RolesMappingProfile,
    IsRoleExistConstraint,
    IsUserExistConstraint,
    RevokedTokensService,
  ],
})
export class EduModule {}
