import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevokedTokensService } from '@vidya/api/auth/services';
import { AuthUsersService } from '@vidya/api/auth/services';
import {
  RolesService,
  SchoolCreationService,
  SchoolsService,
  UsersService,
} from '@vidya/api/edu/services';
import { RedisService } from '@vidya/api/shared/services';
import { School, User, UserRole } from '@vidya/entities';
import { Role } from '@vidya/entities';

import {
  RolesController,
  UserRolesController,
  UsersController,
} from './controllers';
import { SchoolConfigsController } from './controllers/schools/schoolConfigs.controller';
import { SchoolsController } from './controllers/schools/schools.controller';
import { UserSchoolsController } from './controllers/users/userSchools.controller';
import { RolesMappingProfile } from './mappers/roles.mapper';
import { SchoolsMappingProfile } from './mappers/schools.mapper';
import { UsersMappingProfile } from './mappers/users.mapper';
import {
  IsRoleExistConstraint,
  IsSchoolExistConstraint,
  IsUserExistConstraint,
} from './validations';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, School])],
  controllers: [
    RolesController,
    UserRolesController,
    UsersController,
    SchoolsController,
    SchoolConfigsController,
    UserSchoolsController,
  ],
  providers: [
    // Services
    RedisService,
    AuthUsersService,
    RolesService,
    UsersService,
    SchoolsService,
    SchoolCreationService,
    RevokedTokensService,
    // Constraints
    IsRoleExistConstraint,
    IsUserExistConstraint,
    IsSchoolExistConstraint,
    // Mappers
    RolesMappingProfile,
    UsersMappingProfile,
    SchoolsMappingProfile,
  ],
})
export class EduModule {}
