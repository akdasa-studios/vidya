import { createMap, forMember, mapFrom, type Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import * as dto from '@vidya/api/edu/dto';
import * as entities from '@vidya/entities';

@Injectable()
export class RolesMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper, entities.Role, dto.Role,
        forMember((d) => d.id,          mapFrom((s) => s.id),),
        forMember((d) => d.name,        mapFrom((s) => s.name)),
        forMember((d) => d.description, mapFrom((s) => s.description)),
        forMember((d) => d.permissions, mapFrom((s) => s.permissions)),
      );

      createMap(
        mapper, entities.Role, dto.RoleSummary,
        forMember((d) => d.id,          mapFrom((s) => s.id),),
        forMember((d) => d.name,        mapFrom((s) => s.name)),
        forMember((d) => d.description, mapFrom((s) => s.description)),
      );

      createMap(
        mapper, entities.Role, dto.UserRole,
        forMember((d) => d.roleId,      mapFrom((s) => s.id)),
      );

      createMap(
        mapper, dto.CreateRoleRequest, entities.Role,
        forMember((d) => d.name,           mapFrom((s) => s.name)),
        forMember((d) => d.description,    mapFrom((s) => s.description)),
        forMember((d) => d.permissions,    mapFrom((s) => s.permissions)),
        forMember((d) => d.organizationId, mapFrom((s) => s.organizationId)),
        forMember((d) => d.schoolId,       mapFrom((s) => s.schoolId)),
      );

      createMap(
        mapper, dto.UpdateRoleRequest, entities.Role,
        forMember((d) => d.name,        mapFrom((s) => s.name)),
        forMember((d) => d.description, mapFrom((s) => s.description)),
        forMember((d) => d.permissions, mapFrom((s) => s.permissions)),
      );
    };
  }
}
