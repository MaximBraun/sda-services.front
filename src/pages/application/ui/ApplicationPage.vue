<script setup lang="ts">
import MainLayout from '@/app/layouts/main/ui/MainLayout.vue'
import MenuSidebarWidget from '@/widgets/menu/ui/MenuSidebarWidget.vue'

const isAdminData = localStorage.getItem('is_admin')

const isAdmin = isAdminData ? JSON.parse(isAdminData) : false

// import CardComponent from '@/components/card/ui/CardComponent.vue'

// import { DashboardController } from '@/services/api/controllers/dashboard/controller'
// import { useController } from '@/services/composables/apiRetry'

// const token = localStorage.getItem('access_token')
// const tokenType = localStorage.getItem('token_type')

// const controller = new DashboardController({
//   headers: {
//     Authorization: `${tokenType} ${token}`,
//   },
// })

// const applications = useController(
//   controller,
//   (c) => c.applications.get(),
//   'applications',
// )
</script>

<template>
  <MainLayout>
    <template #sidebar>
      <MenuSidebarWidget :is-admin="isAdmin" />
    </template>

    <template #content> </template>
  </MainLayout>
</template>

<style lang="scss">
@use './style' as *;
</style>
