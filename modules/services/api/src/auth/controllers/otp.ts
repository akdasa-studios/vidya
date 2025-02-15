import { HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Routes } from '@vidya/protocol';
import { ErrorResponse, GetOtpRequest, GetOtpResponse } from '../models/auth';
import { OtpService } from '../services/otp';

@Controller()
@ApiTags('Authentication')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  /* -------------------------------------------------------------------------- */
  /*                               POST /auth/otp                               */
  /* -------------------------------------------------------------------------- */

  @Post(Routes().otp.root())
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generates OTP and sends it to the user',
    operationId: 'otp::generate',
    description:
      `Generates OTP and sends it to the user.\n\n` +
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
    // check if an OTP has already been generated and is still valid
    const isExpired = await this.otpService.isExpired(request.destination);
    if (!isExpired) {
      throw new HttpException(
        new GetOtpResponse({
          success: false,
          message: 'An OTP has already been generated and is still valid.',
        }),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // generate a new OTP
    await this.otpService.generate(request.destination, request.type);

    // send the OTP to the user
    if (request.type === 'email') {
      // send the OTP to the email
    } else if (request.type === 'sms') {
      // send the OTP to the phone number
    }

    // return success message
    return new GetOtpResponse();
  }
}
