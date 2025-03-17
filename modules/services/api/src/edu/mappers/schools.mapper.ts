import { createMap, forMember, mapFrom, type Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import * as dto from '@vidya/api/edu/dto';
import * as entities from '@vidya/entities';

@Injectable()
export class SchoolsMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      /* -------------------------------------------------------------------------- */
      /*                               Entities -> Dto                              */
      /* -------------------------------------------------------------------------- */

      createMap(
        mapper, entities.School, dto.SchoolDetails,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      createMap(
        mapper, entities.School, dto.SchoolSummary,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      createMap(
        mapper, entities.School, dto.GetSchoolResponse,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      /* -------------------------------------------------------------------------- */
      /*                            Requests -> Entities                            */
      /* -------------------------------------------------------------------------- */

      createMap(
        mapper, dto.CreateSchoolRequest, entities.School,
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      createMap(
        mapper, dto.UpdateSchoolRequest, entities.School,
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      /* -------------------------------------------------------------------------- */
      /*                             Entity -> Response                             */
      /* -------------------------------------------------------------------------- */

      createMap(
        mapper, entities.School, dto.UpdateSchoolResponse,
        forMember((d) => d.id, mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      createMap(
        mapper, entities.School, dto.CreateSchoolResponse,
        forMember((d) => d.id, mapFrom((s) => s.id)),
      );
    };
  }
}
