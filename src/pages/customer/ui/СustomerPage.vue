<script setup lang="ts">
import MainLayout from '@/app/layouts/main/ui/MainLayout.vue'
import MenuSidebarWidget from '@/widgets/menu/ui/MenuSidebarWidget.vue'

const isAdminData = localStorage.getItem('is_admin')

const isAdmin = isAdminData ? JSON.parse(isAdminData) : false

// import { UserController } from '@/services/api/controllers/user/controller'
// import { useController } from '@/services/composables/apiRetry'

// const token = localStorage.getItem('access_token')
// const tokenType = localStorage.getItem('token_type')

// const controller = new UserController({
//   headers: {
//     Authorization: `${tokenType} ${token}`,
//   },
// })

// const isAdmin = useController(
//   controller,
//   (c) => c.info.get().then((res) => res.role === 'admin'),
//   'is_admin',
// )
</script>

<template>
  <MainLayout>
    <template #sidebar>
      <MenuSidebarWidget :is-admin="isAdmin" />
    </template>

    <template #content></template>
  </MainLayout>
</template>

<style lang="scss">
@use './style' as *;
</style>
