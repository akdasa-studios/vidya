import { createMap, forMember, mapFrom, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import * as dto from "@vidya/api/edu/dto";
import * as entities from "@vidya/entities";

@Injectable()
export class OrganizationsMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper, entities.Organization, dto.OrganizationSummary,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      createMap(
        mapper, entities.Organization, dto.OrganizationDetails,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      );

      createMap(
        mapper, entities.Organization, dto.UpdateOrganizationResponse,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      )

      createMap(
        mapper, entities.Organization, dto.GetOrganizationResponse,
        forMember((d) => d.id,   mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
      )
    }
  } 
}