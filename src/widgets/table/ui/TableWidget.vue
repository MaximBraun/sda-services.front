<script setup lang="ts">
import { ref, computed, defineProps } from 'vue'
import { TableBodyComponent, TableHeadComponent } from '@/components/table'
import ModalComponent from '@/components/modal/ui/ModalComponent.vue'

import { TableRowItem } from '@/shared/types/interface'

const props = defineProps<{
  data: TableRowItem[]
  exclude?: string[]
}>()

const headers = computed(() => {
  if (!props.data || props.data.length === 0) return []
  return Object.keys(props.data[0]).filter(
    (key) => !props.exclude?.includes(key),
  )
})

// --- Модалка ---
const modalOpen = ref(false)
const selectedRow = ref<TableRowItem | null>(null)

function handleEdit(row: TableRowItem) {
  selectedRow.value = row
  modalOpen.value = true
}

function handleDelete(row: TableRowItem) {
  console.log('Удаляем:', row)
  // здесь можно вызвать API или emit наверх
}

const fullImage = ref<string | null>(null)
function openFull(src: string) {
  fullImage.value = src
}
</script>

<template>
  <div class="table">
    <div v-if="!data || data.length === 0" class="table__no-data">
      Missing data
    </div>
    <div v-else class="table__wrapper">
      <table class="table__body">
        <TableHeadComponent :headers="headers" />
      </table>

      <div class="table__scroll">
        <table class="table__body">
          <TableBodyComponent
            :data="data"
            :headers="headers"
            @edit="handleEdit"
            @delete="handleDelete"
            @open-full="openFull"
          />
        </table>
        <div
          v-if="fullImage"
          class="fullscreen__overlay"
          @click="fullImage = null"
        >
          <img :src="fullImage" class="fullscreen__image" />
        </div>
      </div>
    </div>

    <ModalComponent
      :visible="modalOpen"
      :headers="headers"
      :row="selectedRow || undefined"
      @close="modalOpen = false"
      @save="(updatedRow) => console.log('Сохраняем:', updatedRow)"
    />
  </div>
</template>

<style lang="scss">
@use './style' as *;
</style>
