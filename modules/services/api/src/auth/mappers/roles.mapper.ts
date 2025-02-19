import { createMap, forMember, mapFrom, type Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import * as dto from '@vidya/api/auth/dto';
import * as entities from '@vidya/entities';

@Injectable()
export class AuthRolesMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper, entities.Role, dto.UserPermission,
        forMember((d) => d.oid, mapFrom((s) => s.organizationId)),
        forMember((d) => d.sid, mapFrom((s) => s.schoolId)),
        forMember((d) => d.p,   mapFrom((s) => s.permissions)),
      );
    };
  }
}
