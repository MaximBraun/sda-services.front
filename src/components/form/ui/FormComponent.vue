<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  name: string
  type: string
  id: string
  modelValue: string
  hasError?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

// пробрасываем наружу, если где-то нужен прямой доступ к <input>
defineExpose({ inputRef })
</script>

<template>
  <div class="form__group">
    <label :for="id">{{ name }}</label>
    <input
      ref="inputRef"
      :class="['form__group-input', { 'form__group-input--error': hasError }]"
      :type="type"
      :id="id"
      :value="modelValue"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      required
    />
  </div>
</template>

<style lang="scss" scoped>
@use './style' as *;
</style>
