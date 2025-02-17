import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService, UsersService } from '@vidya/api/org/services';
import { Role, User, UserRole } from '@vidya/entities';

import { RolesController } from './controllers/roles.controller';
import { UserRolesController } from './controllers/userRoles.controller';
import { RolesMappingProfile } from './mappers/roles.mapper';
import { IsRoleExistConstraint, IsUserExistConstraint } from './validations';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  controllers: [RolesController, UserRolesController],
  providers: [
    RolesService,
    UsersService,
    RolesMappingProfile,
    IsRoleExistConstraint,
    IsUserExistConstraint,
  ],
})
export class OrgModule {}
