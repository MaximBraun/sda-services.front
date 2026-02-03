<script setup lang="ts">
import { ref, defineProps, defineEmits, nextTick, watch } from 'vue'
import ButtonComponent from '@/components/button/ui/ButtonComponent.vue'
import { DeleteIcon, EditIcon } from '@/app/assets/icons'

import { TableRowItem } from '@/shared/types/interface'

const props = defineProps<{ row: TableRowItem; headers: string[] }>()

const emit = defineEmits<{
  (e: 'edit', row: TableRowItem): void
  (e: 'delete', row: TableRowItem): void
  (e: 'open-full', url: string): void
}>()

const mediaCache = ref<Record<string, string>>({})
const loaded = new Set<string>()

const actions = [
  { id: 1, icon: EditIcon, handler: () => emit('edit', props.row) },
  { id: 2, icon: DeleteIcon, handler: () => emit('delete', props.row) },
]

const getSafeId = (url: string) => btoa(url)
const getLocalPath = (url: string) => url.replace(/^https?:\/\/[^/]+/, '')

const loading = new Map<string, Promise<string>>()

const loadMedia = async (url: string) => {
  if (!url) return ''
  if (mediaCache.value[url]) return mediaCache.value[url]
  if (loading.has(url)) return await loading.get(url)!

  const promise = (async () => {
    try {
      const res = await fetch(getLocalPath(url))
      if (!res.ok) throw new Error(res.statusText)

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)

      mediaCache.value[url] = objectUrl
      loading.delete(url)

      return objectUrl
    } catch (e) {
      console.error('Loading error:', url, e)
      loading.delete(url)
      return ''
    }
  })()

  loading.set(url, promise)
  return await promise
}

const observeMedia = (el: HTMLMediaElement | HTMLImageElement, url: string) => {
  if (!el || loaded.has(url) || mediaCache.value[url]) return
  const observer = new IntersectionObserver(
    async ([entry]) => {
      if (entry.isIntersecting) {
        el.src ||= await loadMedia(url)
        loaded.add(url)
        observer.disconnect()
      }
    },
    { threshold: 0.1 },
  )
  observer.observe(el)
}

watch(
  () => props.row,
  async () => {
    await nextTick()
    const url = props.row['preview_large']
    if (!url) return
    const el = document.getElementById(getSafeId(url)) as
      | HTMLMediaElement
      | HTMLImageElement
    if (!el) return
    if (mediaCache.value[url]) {
      el.src = mediaCache.value[url]
    }
    if (loaded.has(url)) return
    else {
      observeMedia(el, url)
    }
  },
  { immediate: true },
)
</script>

<template>
  <tr class="table__row table__row--body">
    <td
      v-for="header in headers"
      :key="`${props.row.id || props.row.preview_large}-${header}`"
      class="table__cell table__cell--body"
    >
      <template v-if="header === 'is_active'">
        <span
          class="table__cell-status"
          :class="{
            'table__cell-status--active': row[header],
            'table__cell-status--inactive': !row[header],
          }"
        >
          {{ row[header] ? 'active' : 'inactive' }}
        </span>
      </template>

      <template v-else-if="header === 'preview_large'">
        <div class="table__preview-wrapper">
          <template v-if="row[header]">
            <component
              :is="row[header].endsWith('.mp4') ? 'video' : 'img'"
              class="table__preview"
              :id="getSafeId(row[header])"
              v-bind="
                row[header].endsWith('.mp4')
                  ? { controls: true, preload: 'metadata' }
                  : {
                      alt: 'preview',
                      onClick: () => emit('open-full', row[header]),
                    }
              "
            />
          </template>

          <div v-else class="table__preview-mock"></div>
        </div>
      </template>

      <template v-else-if="['templates', 'styles'].includes(header)">
        <p class="table__cell-text">{{ row[header]?.length || 0 }}</p>
      </template>

      <template v-else>
        <p class="table__cell-text">{{ row[header] }}</p>
      </template>
    </td>

    <td class="table__cell table__cell--actions">
      <ButtonComponent
        v-for="action in actions"
        :icon="action.icon"
        :key="action.id"
        type="button"
        @click="action.handler"
      />
    </td>
  </tr>
</template>

<style lang="scss">
@use './style' as *;
</style>
