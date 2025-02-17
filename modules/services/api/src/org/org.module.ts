import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from '@vidya/api/org/services';
import { Role } from '@vidya/entities';

import { RolesController } from './controllers/roles.controller';
import { UserRolesController } from './controllers/userRoles.controller';
import { RolesMappingProfile } from './mappers/roles.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController, UserRolesController],
  providers: [RolesService, RolesMappingProfile],
})
export class OrgModule {}
