import { HttpMethods, HTTPMethodSet, RequestBody, Query } from '../types'

export abstract class IHttpClient {
  protected url: string
  protected headers?: Record<string, string>

  constructor({
    url,
    headers,
  }: {
    url: string
    headers?: Record<string, string>
  }) {
    this.url = url
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    }
  }

  protected buildQueryString(params?: Record<string, unknown>): string {
    if (!params) return ''
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)))
      } else {
        searchParams.set(key, String(value))
      }
    })
    return searchParams.toString() ? `?${searchParams.toString()}` : ''
  }

  protected async request<T>(
    endpoint: string,
    method: HttpMethods,
    body?: Record<string, unknown>,
    query?: Record<string, string | unknown>,
  ): Promise<T> {
    const queryString = this.buildQueryString(query)

    const response = await fetch(`${this.url}${endpoint}${queryString}`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `HTTP ${response.status}: ${errorData?.detail || 'Unknown error'}`,
      )
    }

    return response.json() as Promise<T>
  }

  protected requestMethods<
    U,
    K extends keyof HTTPMethodSet<U> = keyof HTTPMethodSet<U>,
  >(path: string, methodList: readonly K[]): Pick<HTTPMethodSet<U>, K> {
    const map: HTTPMethodSet<U> = {
      get: (query?: Query) =>
        this.request<U | U[]>(path, HttpMethods.GET, undefined, query),
      delete: (query?: Query) =>
        this.request<U>(path, HttpMethods.DELETE, undefined, query),
      put: (body?: RequestBody) => this.request<U>(path, HttpMethods.PUT, body),
      post: (body?: RequestBody) =>
        this.request<U>(path, HttpMethods.POST, body),
    }

    const result = {} as Pick<HTTPMethodSet<U>, K>

    methodList.forEach((m) => {
      result[m] = map[m]!
    })

    return result
  }
}
