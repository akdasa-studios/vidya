export interface AuthRequest {
  login: string;
  code?: string;
}

export interface AuthResponse {
  token?: string | undefined;
}
