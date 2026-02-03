<script setup lang="ts">
import MainLayout from '@/app/layouts/main/ui/MainLayout.vue'
import CardComponent from '@/components/card/ui/CardComponent.vue'
import MenuSidebarWidget from '@/widgets/menu/ui/MenuSidebarWidget.vue'

import { UserController } from '@/services/api/controllers/user/controller'
import { useController } from '@/services/composables/apiRetry'

const token = localStorage.getItem('access_token')
const tokenType = localStorage.getItem('token_type')

const controller = new UserController({
  headers: {
    Authorization: `${tokenType} ${token}`,
  },
})

const isAdmin = useController(
  controller,
  (c) => c.info.get().then((res) => res.role === 'admin'),
  'is_admin',
)

const services = useController(
  controller,
  (c) => c.services.get().then((res) => res.items),
  'services',
)
</script>

<template>
  <MainLayout>
    <template #sidebar>
      <MenuSidebarWidget :isAdmin="isAdmin" />
    </template>

    <template #content>
      <div class="wrapper__services">
        <CardComponent
          v-for="service in services"
          :key="service.id"
          :isAdmin="isAdmin"
          tag="docs"
          :title="service.title"
          :href="`/admin/${service.title}`"
        />
      </div>
    </template>
  </MainLayout>
</template>

<style lang="scss">
@use './style' as *;
</style>
