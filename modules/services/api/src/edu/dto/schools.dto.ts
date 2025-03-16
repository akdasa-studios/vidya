import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as protocol from '@vidya/protocol';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export class SchoolDetails implements protocol.SchoolDetails {
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;
}

export class SchoolSummary implements protocol.SchoolSummary {
  @ApiProperty({ example: 'id' })
  id: string;

  @ApiProperty({ example: 'name' })
  name: string;
}

/* -------------------------------------------------------------------------- */
/*                                     Get                                    */
/* -------------------------------------------------------------------------- */

export class GetSchoolResponse
  extends SchoolDetails
  implements protocol.GetSchoolResponse {}

export class GetSchoolsResponse implements protocol.GetSchoolsResponse {
  constructor(options: { items: Array<SchoolSummary> }) {
    this.items = options.items ?? [];
  }

  @ApiProperty({
    example: [
      {
        id: 'guid',
        name: 'High School',
      },
    ],
  })
  items: SchoolSummary[];
}

/* -------------------------------------------------------------------------- */
/*                                   Create                                   */
/* -------------------------------------------------------------------------- */

export class CreateSchoolRequest implements protocol.CreateSchoolRequest {
  @ApiProperty({ example: 'name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  name: string;

  @ApiProperty({ example: 'description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  description: string;
}

export class CreateSchoolResponse implements protocol.CreateSchoolResponse {
  @ApiProperty({ example: 'd66c9ffa-1d94-4d52-8399-0df211d578f6' })
  id: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

export class UpdateSchoolRequest implements protocol.UpdateSchoolRequest {
  @ApiPropertyOptional({ example: 'name' })
  @IsString()
  @IsOptional()
  @Matches(/[^ ]+/, {
    message: 'name should not be empty',
  })
  @MaxLength(32)
  name?: string;
}

export class UpdateSchoolResponse
  extends SchoolDetails
  implements protocol.UpdateSchoolResponse {}

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export class DeleteSchoolResponse implements protocol.DeleteSchoolResponse {
  constructor(options?: { success: boolean }) {
    this.success = options?.success ?? true;
  }
  @ApiProperty({ example: true })
  success: boolean;
}
