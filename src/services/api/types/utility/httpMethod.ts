import { RequestBody, Query } from '../interfaces/core/httpParams'
import { HttpMethods } from '../enums'

export type HTTPMethodSet<T> = {
  get?: (query?: Query) => Promise<T[] | T>
  post?: (body?: RequestBody) => Promise<T>
  put?: (query?: Query, body?: RequestBody) => Promise<T>
  delete?: (query?: Query) => Promise<T>
}

export const readMethods = [HttpMethods.GET] as const

export const writeMethods = [
  HttpMethods.POST,
  HttpMethods.PUT,
  HttpMethods.DELETE,
] as const

export const fullMethods = [...readMethods, ...writeMethods] as const
