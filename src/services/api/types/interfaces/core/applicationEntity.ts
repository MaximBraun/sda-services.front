import { ITemplate } from './templateEntity'
import { IStyle } from './styleEntity'

export interface IApplication {
  id: number
  app_id: string
  templates: Array<ITemplate>
  styles?: Array<IStyle>
}
