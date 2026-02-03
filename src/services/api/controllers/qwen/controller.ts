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

export class QwenController extends IHttpClient {
  constructor(config?: { headers?: Record<string, string> }) {
    super({
      url: '/qwen/api/v1',
      headers: config?.headers,
    })
  }

  public accounts = this.requestMethods<AccountPixverse>(
    '/accounts',
    toMethodKeys(fullMethods),
  )
}
