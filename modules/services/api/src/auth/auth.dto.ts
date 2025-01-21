import * as protocol from '@vidya/protocol';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthRequest implements protocol.AuthRequest {
  @ApiProperty({ example: 'example@example.com' })
  @IsEmail()
  @IsNotEmpty()
  login: string;

  @ApiPropertyOptional({ example: '123123' })
  @IsString()
  @IsOptional()
  code?: string | undefined;
}

export class AuthResponse implements protocol.AuthResponse {
  @ApiPropertyOptional({ example: 'token' })
  @IsString()
  token?: string | undefined;
}

export class ErrorResponse implements protocol.ErrorResponse {
  @ApiProperty({ example: 'error' })
  @IsString()
  error: string;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: ['message'] })
  message: string[];
}
