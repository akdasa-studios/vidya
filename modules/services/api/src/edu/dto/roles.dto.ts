import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as protocol from '@vidya/protocol';
import { IsOptional, IsString, IsUUID } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export class Role implements protocol.Role {
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;

  @ApiProperty({ example: 'description' })
  description: string;

  @ApiProperty({ example: ['permissions'] })
  permissions: string[];

  @ApiProperty({ example: 'organizationId' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ example: 'schoolId' })
  @IsOptional()
  schoolId?: string;
}

export class RoleSummary implements protocol.RoleSummary {
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;

  @ApiProperty({ example: 'description' })
  description: string;
}

/* -------------------------------------------------------------------------- */
/*                                     Get                                    */
/* -------------------------------------------------------------------------- */

export class GetRoleRequest implements protocol.GetRoleRequest {}
export class GetRoleResponse extends Role implements protocol.GetRoleResponse {
  organizationId: string;
  schoolId?: string;
}

export class GetRoleSummariesListQuery
  implements protocol.GetRoleSummariesListQuery
{
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  schoolId?: string;
}

export class GetRoleSummariesListResponse
  implements protocol.GetRoleSummariesListResponse
{
  constructor(options: { roles: Array<RoleSummary> }) {
    this.roles = options.roles ?? [];
  }

  @ApiProperty({
    example: [
      {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
      },
    ],
  })
  roles: RoleSummary[];
}

/* -------------------------------------------------------------------------- */
/*                                   Create                                   */
/* -------------------------------------------------------------------------- */

export class CreateRoleRequest implements protocol.CreateRoleRequest {
  @ApiProperty({ example: 'name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'description' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['permissions'] })
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({ example: 'organizationId' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ example: 'schoolId' })
  @IsOptional()
  schoolId?: string;
}

export class CreateRoleResponse implements protocol.CreateRoleResponse {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: 'd66c9ffa-1d94-4d52-8399-0df211d578f6' })
  @IsString()
  id: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

export class UpdateRoleRequest implements protocol.UpdateRoleRequest {
  @ApiPropertyOptional({ example: 'name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['permissions'] })
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}

export class UpdateRoleResponse implements protocol.UpdateRoleResponse {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: 'd66c9ffa-1d94-4d52-8399-0df211d578f6' })
  @IsString()
  id: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export class DeleteRoleRequest implements protocol.DeleteRoleRequest {}

export class DeleteRoleResponse implements protocol.DeleteRoleResponse {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: 'd66c9ffa-1d94-4d52-8399-0df211d578f6' })
  @IsString()
  id: string;
}
