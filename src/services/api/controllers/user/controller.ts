import { IHttpClient } from '../core'
import { HttpMethods, UserServices, UserRoutes, UserToken } from '../../types'

import { toMethodKeys } from '../../utils'

export class UserController extends IHttpClient {
  constructor(config?: { headers?: Record<string, string> }) {
    super({
      url: '/user/api/v1',
      headers: config?.headers,
    })
  }

  public services = this.requestMethods<UserServices>(
    '/services',
    toMethodKeys([HttpMethods.GET]),
  ) as { get: () => Promise<UserServices> }

  public info = this.requestMethods<UserToken>(
    '/info',
    toMethodKeys([HttpMethods.GET]),
  ) as { get: () => Promise<UserToken> }

  public routes(title: string) {
    return this.requestMethods<UserRoutes>(
      `/services/${title}/routes`,
      toMethodKeys([HttpMethods.GET]),
    ) as { get: () => Promise<UserRoutes> }
  }
}
