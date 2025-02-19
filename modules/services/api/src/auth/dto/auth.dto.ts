import { ApiProperty } from '@nestjs/swagger';
import * as protocol from '@vidya/protocol';
import { IsNotEmpty, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                Authentcation                               */
/* -------------------------------------------------------------------------- */

export class OtpLogInRequest implements protocol.OtpLogInRequest {
  @ApiProperty({ example: 'example@example.com' })
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: '123123' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class OtpLogInResponse implements protocol.OtpLogInResponse {
  constructor(options: { accessToken: string; refreshToken: string }) {
    this.accessToken = options.accessToken;
    this.refreshToken = options.refreshToken;
  }

  @ApiProperty({ example: 'token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'token' })
  @IsString()
  refreshToken: string;
}

export class RefreshTokensRequest implements protocol.RefreshTokensRequest {
  @ApiProperty({ example: 'refreshToken' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogOutRequest implements protocol.LogOutRequest {
  @ApiProperty({ example: 'refreshToken' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogOutResponse implements protocol.LogOutResponse {}

/* -------------------------------------------------------------------------- */
/*                                   Tokens                                   */
/* -------------------------------------------------------------------------- */

export class RefreshTokensResponse implements protocol.RefreshTokensResponse {
  constructor(options: { accessToken: string; refreshToken: string }) {
    this.accessToken = options.accessToken;
    this.refreshToken = options.refreshToken;
  }

  @ApiProperty({ example: 'accessToken' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({ example: 'refreshToken' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class UserPermission implements protocol.UserPermission {
  @ApiProperty({ example: 'organizationId' })
  oid: string;

  @ApiProperty({ example: 'schoolId' })
  sid?: string;

  @ApiProperty({ example: ['permissions'] })
  p: string[];
}
