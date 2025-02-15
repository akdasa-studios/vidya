import * as protocol from '@vidya/protocol';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/* -------------------------------------------------------------------------- */
/*                              One Time Password                             */
/* -------------------------------------------------------------------------- */

export class GetOtpRequest implements protocol.GetOtpRequest {
  @ApiProperty({ enum: protocol.OtpType, example: 'email' })
  @IsEnum(protocol.OtpType)
  @IsNotEmpty()
  type: protocol.OtpType;

  @ApiProperty({ example: 'example@example.com' })
  @IsString()
  @IsNotEmpty()
  destination: string;
}

export class GetOtpResponse implements protocol.GetOtpResponse {
  constructor(options?: { success?: boolean; message?: string }) {
    this.success = options?.success ?? true;
    this.message = this.success
      ? 'OTP has been sent'
      : (options?.message ?? 'Failed to send OTP');
  }

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'message' })
  message: string;
}

/* -------------------------------------------------------------------------- */
/*                                Authentcation                               */
/* -------------------------------------------------------------------------- */

export class AuthRequest implements protocol.AuthRequest {
  @ApiProperty({ example: 'example@example.com' })
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: '123123' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class AuthResponse implements protocol.AuthResponse {
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

export class LogOutRequest implements protocol.LogOutRequest {
  @ApiProperty({ example: 'refreshToken' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogOutResponse implements protocol.LogOutResponse {}

/* -------------------------------------------------------------------------- */
/*                                   Profile                                  */
/* -------------------------------------------------------------------------- */

export class GetProfileResponse implements protocol.GetProfileResponse {
  constructor(options: { userId: string; email: string; name: string }) {
    this.userId = options.userId;
    this.email = options.email;
    this.name = options.name;
  }

  @ApiProperty({ example: 'ed369256-2db0-46b8-ad49-b2b7a1bed036' })
  userId: string;

  @ApiProperty({ example: 'example@example.com' })
  email: string;

  @ApiProperty({ example: 'name' })
  name: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Common                                   */
/* -------------------------------------------------------------------------- */

export class ErrorResponse implements protocol.ErrorResponse {
  @ApiProperty({ example: 'error' })
  @IsString()
  error: string;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: ['message'] })
  message: string[];
}
