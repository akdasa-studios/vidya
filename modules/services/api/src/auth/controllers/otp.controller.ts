import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import * as dto from '@vidya/api/auth/dto';
import { OtpService } from '@vidya/api/auth/services';
import { Routes } from '@vidya/protocol';

@Controller()
@ApiTags('🎟️ Authentication :: One-Time Password')
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
  @ApiBody({ type: dto.GetOtpRequest })
  @ApiOkResponse({
    type: dto.GetOtpResponse,
    description: 'OTP has been sent to the user.',
  })
  @ApiTooManyRequestsResponse({
    type: dto.ErrorResponse,
    description: 'An OTP has already been generated and is still valid.',
  })
  async generateOtpCode(
    @Body() request: dto.GetOtpRequest,
  ): Promise<dto.GetOtpResponse> {
    // check if an OTP has already been generated and is still valid
    const isExpired = await this.otpService.isExpired(request.destination);
    if (!isExpired) {
      throw new HttpException(
        new dto.GetOtpResponse({
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
    return new dto.GetOtpResponse();
  }
}
