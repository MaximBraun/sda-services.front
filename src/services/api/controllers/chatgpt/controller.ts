import { IHttpClient } from '../core'
import { TemplateChatGPT, ApplicationChatGPT, fullMethods } from '../../types'

import { toMethodKeys } from '../../utils'

export class ChatgptController extends IHttpClient {
  constructor() {
    super({
      url: '/chatgpt/api/v1',
    })
  }

  public templates = this.requestMethods<TemplateChatGPT>(
    '/templates',
    toMethodKeys(fullMethods),
  )
  public applications = this.requestMethods<ApplicationChatGPT>(
    '/applications',
    toMethodKeys(fullMethods),
  )
}
