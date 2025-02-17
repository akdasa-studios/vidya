import { ApiProperty } from '@nestjs/swagger';
import * as protocol from '@vidya/protocol';
import { IsArray, IsUUID } from 'class-validator';

import { IsRoleExist, IsUserExist } from '../validations';

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export class UserRole implements protocol.UserRole {
  @ApiProperty({ example: 'id' })
  roleId: string;
}

/* -------------------------------------------------------------------------- */
/*                                     Get                                    */
/* -------------------------------------------------------------------------- */

export class GetUserRolesListRequest
  implements protocol.GetUserRolesListRequest
{
  @ApiProperty({ example: 'id' })
  @IsUserExist()
  @IsUUID()
  userId: string;
}

export class GetUserRolesListResponse
  implements protocol.GetUserRolesListResponse
{
  constructor(userRoles: UserRole[]) {
    this.userRoles = userRoles;
  }

  @ApiProperty({ example: [{ roleId: 'id' }] })
  @IsArray({ each: true })
  userRoles: UserRole[];
}

/* -------------------------------------------------------------------------- */
/*                                     Set                                    */
/* -------------------------------------------------------------------------- */

export class SetUserRolesQuery implements protocol.SetUserRolesQuery {
  @ApiProperty({ example: 'id' })
  @IsUserExist()
  @IsUUID()
  userId: string;
}

export class SetUserRolesRequest implements protocol.SetUserRolesRequest {
  @ApiProperty({ example: ['roleId'] })
  @IsRoleExist({ each: true })
  @IsUUID('4', { each: true })
  @IsArray()
  roleIds: string[];
}

export class SetUserRolesResponse implements protocol.SetUserRolesResponse {}
