<script setup lang="ts">
import type { Component } from 'vue'
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import ButtonComponent from '@/components/button/ui/ButtonComponent.vue'
import useAuthStore from '@/app/providers/stores'

import { UserController } from '@/services/api/controllers/user/controller'
import { Pagination } from '@/services/api/types'

// иконки
import {
  HomeIcon,
  ApplicationIcon,
  LogoutIcon,
  AccountIcon,
  TemplateIcon,
  StyleIcon,
} from '@/app/assets/icons'

// динамические хуки
import { useController } from '@/services/composables/apiRetry'

interface NavigationItem {
  href?: string
  icon: Component
  onClick?: () => void
}

interface SidebarItem {
  navigation: NavigationItem[]
  logout: NavigationItem[]
}

const props = defineProps<{ title?: string; isAdmin?: boolean }>()

const router = useRouter()
const authStore = useAuthStore()

const token = localStorage.getItem('access_token')
const tokenType = localStorage.getItem('token_type')

// состояние
const sidebarItems = ref<SidebarItem>({
  navigation: [],
  logout: [],
})

// иконки для API-навигации
const iconMap: Record<string, Component> = {
  accounts: AccountIcon,
  services: HomeIcon,
  applications: ApplicationIcon,
  styles: StyleIcon,
  templates: TemplateIcon,
}

async function logout() {
  await authStore.logout()
  await router.push('/')
}

// следим за props.title и строим навигацию
watchEffect(async () => {
  if (!props.title) {
    // статический вариант
    sidebarItems.value = {
      navigation: [
        { href: '/services', icon: HomeIcon },
        // { href: '/applications', icon: ApplicationIcon },
        // ...(props.isAdmin ? [{ href: '/customers', icon: UserIcon }] : []),
      ],
      logout: [{ icon: LogoutIcon, onClick: logout }],
    }
  } else {
    // динамический вариант
    try {
      const controller = new UserController({
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      })
      const responseRef = useController(
        controller,
        (c) =>
          c
            .routes(props.title)
            .get()
            .then(
              (res: Pagination<{ id: number; title: string }>) => res.items,
            ),
        `${props.title}_routes`,
      )

      watchEffect(() => {
        const response = responseRef.value as { id: number; title: string }[]
        if (!response) return

        sidebarItems.value = {
          navigation: response.map((item: { title: string; id: number }) => ({
            href: `/admin/${props.title}/${item.title}`,
            icon: iconMap[item.title] || HomeIcon,
          })),
          logout: [{ icon: LogoutIcon, href: '/services' }],
        }

        if (router.currentRoute.value.path === `/admin/${props.title}`) {
          router.push(sidebarItems.value.navigation[0].href!)
        }
      })
    } catch (e) {
      console.error('Error an occurred while inizializating routes:', e)
    }
  }
})
</script>

<template>
  <div class="sidebar">
    <div class="sidebar__logo">
      <router-link :to="'/'" class="sidebar__logo-title"> sda </router-link>
    </div>

    <div
      v-for="(items, section) in sidebarItems"
      :key="section"
      :class="`sidebar__${section}`"
    >
      <ButtonComponent
        v-for="item in items"
        :key="item.href"
        :href="item.href"
        :icon="item.icon"
        :onClick="item.onClick"
      >
        <p class="sidebar__navigation-text">
          {{
            item.href ? item.href?.split('/').filter(Boolean).pop() : 'logout'
          }}
        </p>
      </ButtonComponent>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use './style' as *;
</style>
