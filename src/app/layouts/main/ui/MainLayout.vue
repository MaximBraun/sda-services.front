<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ mainClass?: string }>()

const mainClass = computed(() => props.mainClass ?? '')
</script>

<template>
  <div class="wrapper">
    <aside>
      <slot name="sidebar" />
    </aside>
    <main :class="mainClass">
      <slot name="content" />
    </main>
  </div>
</template>

<style lang="scss">
@use './style' as *;
</style>
