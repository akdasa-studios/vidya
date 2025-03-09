import * as domain from '@vidya/domain';
import { OtpType } from "./otp";

/* -------------------------------------------------------------------------- */
/*                              One Time Password                             */
/* -------------------------------------------------------------------------- */

/**
 * Request to get OTP for the specified destination.
 */
export interface GetOtpRequest {
  /** Type of the destination */
  type: OtpType;

  /** Destination to send the OTP to */
  destination: string;
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
/*                                   Tokens                                   */
/* -------------------------------------------------------------------------- */

export interface JwtToken {
  sub: string;
  exp: number;
  iat: number;
  jti: string;
}

export interface AccessToken extends JwtToken {
  /**
   * User permissions.
   * @remarks This is an optional field. If not provided, service
   *          should check the user's permissions from the database.
   *          This is useful during development to avoid unnecessary
   *          token refreshes.
   */
  permissions?: UserPermission[];
}

export interface RefreshToken extends JwtToken {
}

/**
 * Generates a storage key for a revoked JWT token.
 * @param token - The JWT token object containing the `jti` (JWT ID) property.
 * @returns A string representing the storage key for the revoked token.
 */
export const RevokedTokenStorageKey = (token: JwtToken) => `tokens:revoked:${token.jti}`;

/* -------------------------------------------------------------------------- */
/*                               Authentication                               */
/* -------------------------------------------------------------------------- */

export interface OtpLogInRequest {
  /** Login to sign up with */
  login: string;

  /** OTP to validate */
  otp: string;
}

export interface OtpLogInResponse {
  /** Access token to authenticate user */
  accessToken: string;

  /** Refresh token to refresh the access token */
  refreshToken: string;
}

export interface RefreshTokensRequest {
  /** Refresh token */
  refreshToken: string;
}

export interface RefreshTokensResponse {
  /** New access token */
  accessToken: string;

  /** Optional refresh token */
  refreshToken: string;
}

export interface LogOutRequest {
  /** Refresh token */
  refreshToken: string;
}

export interface LogOutResponse {
}

/* -------------------------------------------------------------------------- */
/*                                 Permissions                                */
/* -------------------------------------------------------------------------- */

/**
 * Permission object. Contains the organization ID, school ID, and permission.
 * @remarks Used short names for the properties to reduce the size of a JWT token.
 */
export type UserPermission = {
  /**
   * Organization ID
   */
  oid: string, 

  /* School ID */
  sid?: string,
  
  /* Permissions */
  p: domain.PermissionKey[]
}

/* -------------------------------------------------------------------------- */
/*                                   Profile                                  */
/* -------------------------------------------------------------------------- */

export interface GetProfileResponse {
  /** User's ID */
  userId: string;

  /** User's email */
  email: string;

  /** User's name */
  name: string;
}
