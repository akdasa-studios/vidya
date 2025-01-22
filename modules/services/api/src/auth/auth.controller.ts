import { HttpCode } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Routes } from '@vidya/protocol';
import { AuthRequest, AuthResponse, ErrorResponse } from './auth.dto';
import { OtpService } from './otp.service';

@Controller()
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly otpService: OtpService) {}

  @Post(Routes().auth.login())
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authorizes user',
    operationId: 'auth::login',
    description:
      `Authorizes user by email and OTP.\n\n` +
      `Returns access and refresh tokens if the user has been authorized.`,
  })
  @ApiBody({ type: AuthRequest })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'User has been authorized.',
  })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Email is invalid.',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponse,
    description: 'OTP is invalid.',
  })
  @ApiTooManyRequestsResponse({
    type: ErrorResponse,
    description: 'Too many requests',
  })
  async login(@Body() request: AuthRequest): Promise<AuthResponse> {
    // TODO: rate limit login attempts
    const isValid = await this.otpService.validate(request.email, request.otp);

    if (!isValid) {
      throw new UnauthorizedException(['otp is invalid']);
    }

    // TODO: create new user if not exists
    // TODO: generate new tokens and return them

    const response = new AuthResponse();
    response.accessToken = 'token';
    response.refreshToken = 'token';
    return response;
  }
}
