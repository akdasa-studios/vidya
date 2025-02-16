import { createMap, forMember, mapFrom, type Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import * as dto from '@vidya/api/org/dto';
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
        mapper, dto.CreateRoleRequest, entities.Role,
        forMember((d) => d.name,        mapFrom((s) => s.name)),
        forMember((d) => d.description, mapFrom((s) => s.description)),
        forMember((d) => d.permissions, mapFrom((s) => s.permissions)),
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
