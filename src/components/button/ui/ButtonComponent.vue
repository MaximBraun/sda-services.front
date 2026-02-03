<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  href?: string
  icon?: Component
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <router-link
    v-if="href"
    :to="href"
    class="sidebar__navigation-button"
    exact-active-class="sidebar__navigation-button--exact-active"
  >
    <component v-if="icon" :is="icon" class="sidebar__navigation-icon" />
  </router-link>

  <button
    v-else
    :type="type || 'button'"
    class="sidebar__navigation-button"
    @click="onClick"
  >
    <component v-if="icon" :is="icon" class="sidebar__navigation-icon" />
  </button>
  <slot />
</template>

<style lang="scss" scoped>
@use './style' as *;
</style>
