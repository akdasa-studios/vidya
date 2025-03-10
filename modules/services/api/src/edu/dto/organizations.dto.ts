import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as protocol from '@vidya/protocol';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export class OrganizationSummary implements protocol.OrganizationSummary {
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;
}

export class OrganizationDetails implements protocol.OrganizationSummary {
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;
}

/* -------------------------------------------------------------------------- */
/*                                    Read                                    */
/* -------------------------------------------------------------------------- */

export class GetOrganizationsResponse
  implements protocol.GetOrganizationsResponse
{
  @ApiProperty({ type: [OrganizationSummary] })
  items: OrganizationSummary[];
}

export class GetOrganizationResponse
  implements protocol.GetOrganizationResponse
{
  @ApiProperty({ example: 'ea53353e-2255-4eef-8709-d52cd837ce8e' })
  id: string;

  @ApiProperty({ example: 'Organization' })
  name: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

export class UpdateOrganizationRequest
  implements protocol.UpdateOrganizationRequest
{
  @ApiPropertyOptional({ example: 'Organization' })
  @IsString()
  @IsOptional()
  @Matches(/[^ ]+/, {
    message: 'name should not be empty',
  })
  @MaxLength(128)
  name?: string;
}

export class UpdateOrganizationResponse
  implements protocol.UpdateOrganizationResponse
{
  @ApiProperty({ example: 'ea53353e-2255-4eef-8709-d52cd837ce8e' })
  id: string;

  @ApiProperty({ example: 'Organization' })
  name: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export class DeleteOrganizationResponse {
  constructor(options?: { success: boolean }) {
    this.success = options.success;
  }
  @ApiProperty({ example: 'success' })
  success: boolean;
}
