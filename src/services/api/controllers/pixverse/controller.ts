import { IHttpClient } from '../core'
import {
  AccountPixverse,
  HttpMethods,
  StylePixverse,
  TemplatePixverse,
  ApplicationPixverse,
  fullMethods,
  writeMethods,
} from '../../types'

import { toMethodKeys } from '../../utils'

const templateListMethods = [
  HttpMethods.GET,
  HttpMethods.POST,
  HttpMethods.DELETE,
] as const

export class PixverseController extends IHttpClient {
  constructor(config?: { headers?: Record<string, string> }) {
    super({
      url: '/pixverse/api/v1',
      headers: config?.headers,
    })
  }

  public accounts = this.requestMethods<AccountPixverse>(
    '/accounts',
    toMethodKeys(fullMethods),
  )
  public templates = (() => {
    const { get, post, delete: del } = this.requestMethods<TemplatePixverse>(
      '/templates',
      toMethodKeys(templateListMethods),
    )
    return {
      get,
      post,
      delete: del,
      put: (id: number, body?: Record<string, unknown>) =>
        this.request<TemplatePixverse>(
          `/templates/${id}`,
          HttpMethods.PUT,
          body,
        ),
    }
  })()
  public styles = this.requestMethods<StylePixverse>(
    '/styles',
    toMethodKeys(fullMethods),
  )
  public applications = this.requestMethods<ApplicationPixverse>(
    '/applications',
    toMethodKeys(fullMethods),
  )
}
