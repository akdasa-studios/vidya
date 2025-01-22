/* -------------------------------------------------------------------------- */
/*                              One Time Password                             */
/* -------------------------------------------------------------------------- */

/**
 * Request to get OTP for the specified email.
 */
export interface GetOtpRequest {
  /** Email to send OTP to */
  email: string;
}

/**
 * Response to get OTP for the specified email.
 */
export interface GetOtpResponse {
  /** True if the OTP has been successfully sent. */
  success: boolean;

  /** Message describing the result of the operation. */
  message: string;
}

/* -------------------------------------------------------------------------- */
/*                               Authentication                               */
/* -------------------------------------------------------------------------- */

export interface AuthRequest {
  /** Email to sign up with */
  email: string;

  /** OTP to validate the email */
  otp: string;
}

export interface AuthResponse {
  /** Access token to authenticate user */
  accessToken: string;

  /** Refresh token to refresh the access token */
  refreshToken: string;
}
