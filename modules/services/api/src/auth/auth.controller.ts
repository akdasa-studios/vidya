import { HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Routes } from '@vidya/domain';
import { AuthRequest, AuthResponse, ErrorResponse } from './auth.dto';
import { AuthService } from './auth.service';

@Controller()
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(Routes().auth.login())
  @HttpCode(200)
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
    description: 'Code is invalid.',
  })
  @ApiTooManyRequestsResponse({
    type: ErrorResponse,
    description: 'An OTP code has already been generated and is still valid.',
  })
  @ApiOperation({
    summary: 'Authorizes user',
    operationId: 'login',
    description:
      'Gnerates an OTP code for the user. User should provide the code in the next request.',
  })
  async login(@Body() request: AuthRequest): Promise<AuthResponse> {
    // TODO: rate limit login attempts
    const response = new AuthResponse();

    if (request.login && request.code) {
      const isCodeValid = await this.authService.validateAuthCode(
        request.login,
        request.code,
      );

      if (!isCodeValid) {
        throw new UnauthorizedException(['code is invalid']);
      }

      response.token = 'token';
    } else if (request.login && !request.code) {
      const isCodeExpired = await this.authService.isAuthCodeExpired(
        request.login,
      );
      if (!isCodeExpired) {
        // TODO: Retry-After header
        throw new HttpException(
          {
            error: 'Too Many Requests',
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: [
              'An OTP code has already been generated and is still valid.',
            ],
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      await this.authService.generateAuthCode(request.login);
    }

    return response;
  }
}
