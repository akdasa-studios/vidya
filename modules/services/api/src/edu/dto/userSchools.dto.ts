import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString, IsUUID } from 'class-validator';

import { IsSchoolExist } from '../validations';

/* -------------------------------------------------------------------------- */
/*                                     Get                                    */
/* -------------------------------------------------------------------------- */

export class GetUserSchoolsListResponse {
  constructor(userSchools: string[]) {
    this.userSchools = userSchools;
  }

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsString({ each: true })
  userSchools: string[];
}

/* -------------------------------------------------------------------------- */
/*                                     Set                                    */
/* -------------------------------------------------------------------------- */

export class AddUserSchoolsRequest {
  @ApiProperty({ example: 'id' })
  @IsSchoolExist()
  @IsUUID('4')
  schoolId: string;
}

export class AddUserSchoolsResponse {
  constructor(options?: { success: boolean }) {
    this.success = options?.success ?? false;
  }

  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;
}
