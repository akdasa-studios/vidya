import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevokedTokensService } from '@vidya/api/auth/services';
import { RolesService, UsersService } from '@vidya/api/edu/services';
import { User, UserRole } from '@vidya/entities';
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
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, Organization])],
  controllers: [RolesController, UserRolesController, OrganizationsController],
  providers: [
    RolesService,
    UsersService,
    RolesMappingProfile,
    IsRoleExistConstraint,
    IsUserExistConstraint,
    RevokedTokensService,
    OrganizationsMapperProfile,
    OrganizationsService,
  ],
})
export class EduModule {}
