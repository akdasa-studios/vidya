import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService, UsersService } from '@vidya/api/org/services';
import { User, UserRole } from '@vidya/entities';
import { Organization, Role } from '@vidya/entities';

import { RevokedTokensService } from '../auth/services';
import { OrganizationsController } from './controllers/organizations.controller';
import { RolesController } from './controllers/roles.controller';
import { UserRolesController } from './controllers/userRoles.controller';
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
export class OrgModule {}
