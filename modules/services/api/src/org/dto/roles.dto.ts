import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as protocol from '@vidya/protocol';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class Role implements protocol.Role {
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;

  @ApiProperty({ example: 'description' })
  description: string;

  @ApiProperty({ example: ['permissions'] })
  permissions: string[];
}

export class GetRolesListResponse implements protocol.GetRolesListResponse {
  constructor(options?: { roles?: Array<Role> }) {
    this.roles = options?.roles ?? [];
  }

  @ApiProperty({
    example: [
      {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
        permissions: ['course:read', 'course:write'],
      },
    ],
  })
  roles: Array<Role>;
}

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
}

export class CreateRoleResponse implements protocol.CreateRoleResponse {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: 'd66c9ffa-1d94-4d52-8399-0df211d578f6' })
  @IsString()
  id: string;
}

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

export class UpdateRoleResponse implements protocol.UpdateRoleResponse {}
