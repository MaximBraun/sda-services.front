<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { useDynamicController } from '@/services/composables/dynamicController'
import { useController } from '@/services/composables/apiRetry'

import MenuSidebarWidget from '@/widgets/menu'
import MainLayout from '@/app/layouts/main/ui/MainLayout.vue'
import TableWidget from '@/widgets/table/ui/TableWidget.vue'

const route = useRoute()

const controller = ref<any>(null)
const data = ref<any>(null)

async function loadData() {
  const title = route.params.title as string
  const method = route.params.subroute as string

  if (!title || !method) return

  controller.value = await useDynamicController(title)
  data.value = useController(
    controller.value,
    (c) => c[method].get(),
    `${title}_${method}`,
  )
}

watchEffect(() => {
  loadData()
})
</script>

<template>
  <MainLayout>
    <template #sidebar>
      <MenuSidebarWidget :title="route.params.title" />
    </template>
    <template #content>
      <div class="wrapper__admin">
        <TableWidget
          :data="data?.value"
          :exclude="[
            'id',
            'prompt',
            'template_id',
            'preview_small',
            // 'templates',
            // 'styles',
          ]"
        />
      </div>
    </template>
  </MainLayout>
</template>

<style lang="scss">
@use './style' as *;
</style>
