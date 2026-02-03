import { IHttpClient } from '../core'
import {
  AccountPixverse,
  StylePixverse,
  TemplatePixverse,
  ApplicationPixverse,
  fullMethods,
  writeMethods,
} from '../../types'

import { toMethodKeys } from '../../utils'

export class PikaController extends IHttpClient {
  constructor(config?: { headers?: Record<string, string> }) {
    super({
      url: '/pika/api/v1',
      headers: config?.headers,
    })
  }

  public accounts = this.requestMethods<AccountPixverse>(
    '/accounts',
    toMethodKeys(fullMethods),
  )
  public templates = this.requestMethods<TemplatePixverse>(
    '/templates',
    toMethodKeys(fullMethods),
  )
  public applications = this.requestMethods<ApplicationPixverse>(
    '/applications',
    toMethodKeys(fullMethods),
  )
}
