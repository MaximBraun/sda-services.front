import { Pagination } from '../core'

interface UserService {
  id: number
  title: string
}

interface ServiceRoute {
  id: number
  title: string
}

export interface UserServices extends Omit<Pagination, 'items'> {
  items: UserService[]
}

export interface UserRoutes extends Omit<Pagination, 'items'> {
  items: ServiceRoute[]
}
