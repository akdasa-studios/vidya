import { createMap, forMember, mapFrom, type Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import * as dto from '@vidya/api/edu/dto';
import * as entities from '@vidya/entities';

@Injectable()
export class UsersMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      /* -------------------------------------------------------------------------- */
      /*                               Entities -> Dto                              */
      /* -------------------------------------------------------------------------- */

      createMap(
        mapper, entities.User, dto.UserSummary,
        forMember((d) => d.id,   mapFrom((s) => s.id),),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      createMap(
        mapper, entities.User, dto.GetUserResponse,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
        forMember((d) => d.email, mapFrom((s) => s.email)),
        forMember((d) => d.phone, mapFrom((s) => s.phone))
      );

      createMap(
        mapper, entities.User, dto.UpdateUserResponse,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
        forMember((d) => d.email, mapFrom((s) => s.email)),
        forMember((d) => d.phone, mapFrom((s) => s.phone))
      );
    };
  }
}
