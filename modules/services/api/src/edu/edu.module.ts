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
import { Organization, Role } from '@vidya/entities';

import {
  OrganizationsController,
  RolesController,
  UserRolesController,
} from './controllers';
import { OrganizationsMapperProfile } from './mappers/organizations.mapper';
import { RolesMappingProfile } from './mappers/roles.mapper';
import { OrganizationsService } from './services/organizations.service';
import { IsRoleExistConstraint, IsUserExistConstraint } from './validations';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserRole, Organization, School]),
  ],
  controllers: [RolesController, UserRolesController, OrganizationsController],
  providers: [
    AuthUsersService,
    RolesService,
    UsersService,
    SchoolsService,
    RolesMappingProfile,
    IsRoleExistConstraint,
    IsUserExistConstraint,
    RevokedTokensService,
    OrganizationsMapperProfile,
    OrganizationsService,
  ],
})
export class EduModule {}
