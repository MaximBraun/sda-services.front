import { defineAsyncComponent } from 'vue'

const routes = [
  {
    path: '/',
    children: [
      {
        path: '',
        name: 'auth',
        component: () => import('@/pages/auth'),
      },
      {
        path: '/services',
        name: 'services',
        component: defineAsyncComponent(() => import('@/pages/service')),
        meta: { requiresAuth: true },
      },
      {
        path: '/applications',
        name: 'applications',
        component: defineAsyncComponent(() => import('@/pages/application')),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers',
        name: 'customers',
        component: defineAsyncComponent(() => import('@/pages/customer')),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/admin/:title',
        name: 'admin',
        component: defineAsyncComponent(() => import('@/pages/admin')),
        props: true,
        meta: { requiresAuth: true },
        children: [
          {
            path: ':subroute',
            name: 'admin-subroute',
            props: true,
          },
        ],
      },
    ],
  },
]

export default routes
