import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { IsRoleExist } from '../validations';

export class GetSchoolConfigResponse {
  @ApiProperty({ example: 'id' })
  defaultStudentRoleId: string;

  @ApiProperty({ example: ['studentRoleIds'] })
  studentRoleIds: string[];
}

export class UpdateSchoolConfigsRequest {
  @ApiPropertyOptional({ example: 'id' })
  @IsOptional()
  @IsUUID()
  @IsRoleExist()
  defaultStudentRoleId?: string;

  @ApiPropertyOptional({ example: ['studentRoleIds'] })
  @IsOptional()
  @IsUUID(4, { each: true })
  studentRoleIds?: string[];
}

export class UpdateSchoolConfigResponse {
  constructor(options?: { success: boolean }) {
    this.success = options?.success ?? false;
  }

  @ApiProperty({ example: true })
  success: boolean;
}
