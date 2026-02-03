<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from 'vue'
import ButtonComponent from '@/components/button/ui/ButtonComponent.vue'

interface TableRow {
  [key: string]: string | number | boolean | null
}

const props = defineProps<{
  visible: boolean
  headers: string[]
  row?: TableRow
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', row: TableRow): void
}>()

const formData = ref<TableRow>({})

watch(
  () => props.row,
  (newRow) => {
    if (newRow) {
      formData.value = { ...newRow }
      nextTick(() => autoResizeAll())
    }
  },
  { immediate: true },
)

function handleSave() {
  emit('save', formData.value)
  emit('close')
}

function autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

function autoResizeAll() {
  const textareas = document.querySelectorAll(
    '.modal__textarea',
  ) as NodeListOf<HTMLTextAreaElement>
  textareas.forEach((ta) => {
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
  })
}
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="modal__backdrop">
      <transition name="slide-down">
        <div class="modal__content">
          <h2 class="modal__title">Edit Data</h2>

          <div class="modal__form">
            <div
              v-for="(value, key) in formData"
              :key="key"
              v-if="key !== 'id'"
              class="modal__form-field"
            >
              <label class="modal__label">{{ key }}</label>

              <textarea
                v-model="formData[key]"
                class="modal__textarea"
                :rows="1"
                @input="autoResize"
              />
            </div>
          </div>

          <div class="modal__actions">
            <ButtonComponent
              type="button"
              @click="emit('close')"
              class="cancel-button"
            >
              Cancel
            </ButtonComponent>
            <ButtonComponent
              type="button"
              @click="handleSave"
              class="save-button"
            >
              Save
            </ButtonComponent>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.modal__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal__content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 800px;
  max-height: 80vh; // ограничиваем высоту
  overflow-y: auto; // включаем скролл
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal__title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #111;
}

.modal__form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.modal__form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal__label {
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
  color: #555;
}

.modal__textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  resize: none;
  overflow: hidden;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    outline: none;
  }
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 24px;

  .cancel-button {
    background: #f3f4f6;
    color: #374151;
  }

  .save-button {
    background: #3b82f6;
    color: #fff;
  }
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-down-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
