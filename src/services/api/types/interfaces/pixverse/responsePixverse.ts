import { AccountPixverse } from './accountPixverse'
import { StylePixverse } from './stylePixverse'
import { TemplatePixverse } from './templatePixverse'
import { ApplicationPixverse } from './applicationPixverse'

export type ResponsePixverse =
  | AccountPixverse
  | StylePixverse
  | TemplatePixverse
  | ApplicationPixverse
