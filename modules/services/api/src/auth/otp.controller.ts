import { HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Routes } from '@vidya/domain';
import { ErrorResponse, GetOtpRequest, GetOtpResponse } from './auth.dto';
import { OtpService } from './otp.service';

@Controller()
@ApiTags('Authentication')
export class OtpController {
  constructor(private readonly authService: OtpService) {}

  @Post(Routes().otp.root())
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generates OTP and sends it to the user',
    operationId: 'otp::generate',
    description:
      `Generates OTP and sends it to the user by email.\n\n` +
      `Returns success message if the OTP has been sent. If the OTP has ` +
      `already been generated and is still valid, returns an error message.`,
  })
  @ApiBody({ type: GetOtpRequest })
  @ApiOkResponse({
    type: GetOtpResponse,
    description: 'OTP has been sent to the user.',
  })
  @ApiTooManyRequestsResponse({
    type: ErrorResponse,
    description: 'An OTP has already been generated and is still valid.',
  })
  async generateOtpCode(
    @Body() request: GetOtpRequest,
  ): Promise<GetOtpResponse> {
    const isExpired = await this.authService.isExpired(request.email);

    if (!isExpired) {
      const response = new GetOtpResponse();
      response.success = false;
      response.message =
        'An OTP has already been generated and is still valid.';
      throw new HttpException(response, HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.authService.generate(request.email);
    const response = new GetOtpResponse();
    response.success = true;
    response.message = 'OTP has been sent to the user.';
    return response;
  }
}
