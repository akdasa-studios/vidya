import * as protocol from '@vidya/protocol';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/* -------------------------------------------------------------------------- */
/*                              One Time Password                             */
/* -------------------------------------------------------------------------- */

export class GetOtpRequest implements protocol.GetOtpRequest {
  @ApiProperty({ example: 'example@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class GetOtpResponse implements protocol.GetOtpResponse {
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
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123123' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class AuthResponse implements protocol.AuthResponse {
  @ApiProperty({ example: 'token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'token' })
  @IsString()
  refreshToken: string;
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
