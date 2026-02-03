export interface AuthRefreshToken {
  refresh_token: string | null
}

export interface AuthUserTokens extends AuthRefreshToken {
  token_type?: string | null
  access_token: string | null
}
