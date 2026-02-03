export interface UserToken {
  typ: string
  sub: string
  exp: number
  iat: number
  jti: string
  role: string
}
