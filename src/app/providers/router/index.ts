import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import useAuthStore from '../stores'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  const servicesData = localStorage.getItem('services')
  const isAdminData = localStorage.getItem('is_admin')

  const isAdmin = isAdminData ? JSON.parse(isAdminData) : false
  const services = servicesData ? JSON.parse(servicesData) : []

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'auth' }
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return { name: 'services' }
  }

  if (to.name === 'auth' && authStore.isAuthenticated) {
    return { name: 'services' }
  }

  if (to.name === 'admin') {
    const adminTitle = to.params.title as string
    const service = services.find(
      (s: { id: number; title: string }) => s.title === adminTitle,
    )

    if (!service) {
      return { name: 'services', params: { title: adminTitle } }
    }
  }

  if (!to.matched.length) {
    return { name: 'services' }
  }
})

export default router
