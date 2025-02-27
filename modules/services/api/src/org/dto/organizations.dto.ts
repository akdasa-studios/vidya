import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as protocol from '@vidya/protocol';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class Organization implements protocol.Organization {
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;
}

export class GetOrganizationsResponse
  implements protocol.GetOrganizationsResponse
{
  @ApiProperty({ type: [Organization] })
  items: Organization[];
}

export class GetOrganizationResponse
  implements protocol.GetOrganizationResponse
{
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;
}

export class CreateOrganizationRequest
  implements protocol.CreateOrganizationRequest
{
  @ApiProperty({ example: 'name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateOrganizationResponse
  implements protocol.CreateOrganizationResponse
{
  @ApiProperty({ example: 'id' })
  @IsString()
  id: string;
}

export class UpdateOrganizationRequest
  implements protocol.UpdateOrganizationRequest
{
  @ApiPropertyOptional({ example: 'name' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

export class UpdateOrganizationResponse
  implements protocol.UpdateOrganizationResponse
{
  @ApiProperty({ example: 'id' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;
}

export class DeleteOrganizationResponse {
  @ApiProperty({ example: 'success' })
  success: boolean;
}
