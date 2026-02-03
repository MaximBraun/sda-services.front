<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  headers: string[]
}>()
</script>

<template>
  <thead class="table__head">
    <tr class="table__row table__row--head">
      <th
        v-for="header in headers"
        :key="header"
        class="table__cell table__cell--head"
      >
        <p class="table__cell-text">{{ header }}</p>
      </th>

      <th class="table__cell table__cell--head table__cell--actions">
        Actions
      </th>
    </tr>
  </thead>
</template>

<style lang="scss">
@use './style' as *;
</style>
