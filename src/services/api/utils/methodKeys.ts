import { HttpMethods } from '../types/enums/httpMethod'
import { HTTPMethodSet } from '../types/utility/httpMethod'

export const toMethodKeys = <T>(
  methods: readonly HttpMethods[],
): Array<keyof HTTPMethodSet<T>> =>
  methods.map((method) => method.toLowerCase() as keyof HTTPMethodSet<T>)
