<script setup lang="ts">
import ButtonComponent from '@/components/button/ui/ButtonComponent.vue'
import LinkIcon from '@/app/assets/icons/LinkIcon.vue'

defineProps<{
  title: string
  tag?: string
  isAdmin?: Boolean
  href?: string
  className?: string
}>()

const appUrl = import.meta.env.VITE_APP_URL
</script>

<template>
  <div class="base__card">
    <div class="base__card-header">
      <h3 class="base__card-header__title">{{ title }}</h3>
      <a
        v-if="isAdmin"
        class="base__card-header__tag"
        :href="`${appUrl}/${title}/docs`"
        target="_blank"
      >
        {{ tag }}
      </a>
    </div>

    <div :class="className">
      <slot />
      <ButtonComponent v-if="href" :href="href" :icon="LinkIcon" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use './style' as *;
</style>
