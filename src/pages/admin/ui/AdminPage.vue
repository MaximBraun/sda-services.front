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

function parseBoolish(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const s = value.toLowerCase().trim()
    if (['true', '1', 'yes'].includes(s)) return true
    if (['false', '0', 'no'].includes(s)) return false
  }
  return Boolean(value)
}

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

async function persistAdminRow(row: Record<string, unknown>) {
  const title = route.params.title as string
  const sub = route.params.subroute as string
  const c = controller.value
  if (!c || !title || !sub) {
    throw new Error('Контроллер или маршрут не готовы')
  }

  if (title === 'pixverse' && sub === 'templates') {
    const id = Number(row.id)
    if (!Number.isFinite(id)) {
      throw new Error('Некорректный id строки (нужен числовой PK из БД)')
    }

    await c.templates.put(id, {
      name: String(row.name ?? ''),
      prompt:
        row.prompt === undefined || row.prompt === null
          ? null
          : String(row.prompt),
      category:
        row.category === undefined || row.category === null
          ? null
          : String(row.category),
      is_active: parseBoolish(row.is_active),
    })

    localStorage.removeItem(`${title}_${sub}`)
    await loadData()
    return
  }

  throw new Error(`Сохранение для «${title} / ${sub}» пока не подключено к API`)
}
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
          :on-save-row="persistAdminRow"
        />
      </div>
    </template>
  </MainLayout>
</template>

<style lang="scss">
@use './style' as *;
</style>
