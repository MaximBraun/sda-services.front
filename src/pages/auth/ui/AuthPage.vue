<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import MainLayout from '@/app/layouts/main/ui/MainLayout.vue'
import FormComponent from '@/components/form/ui/FormComponent.vue'
import ButtonComponent from '@/components/button/ui/ButtonComponent.vue'
import LinkIcon from '@/app/assets/icons/LinkIcon.vue'

import useAuthStore from '@/app/providers/stores'
import type { AuthUserCredentials } from '@/services/api/types'

const controller = useAuthStore()
const router = useRouter()

const formData = reactive<AuthUserCredentials>({
  username: '',
  password: '',
})

const error = ref<string | null>(null)

const authUser = async () => {
  try {
    const response = await controller.auth({ ...formData })

    if (response?.access_token) {
      await router.push('/services')
    } else if (response?.detail) {
      error.value = response.detail
      for (const key in formData) {
        formData[key as keyof AuthUserCredentials] = ''
      }
    }
  } catch (err: { message: string }) {
    console.error('Authorization error: ', err)
    error.value = err?.message || 'Network error'
    for (const key in formData) {
      formData[key as keyof AuthUserCredentials] = ''
    }
  }
}

const authFormItems = [
  { name: 'username', type: 'text', id: 'uname', key: 'username' },
  { name: 'password', type: 'password', id: 'upass', key: 'password' },
] as const
</script>

<template>
  <MainLayout mainClass="auth__layout">
    <template #content>
      <form class="auth__card" @submit.prevent="authUser">
        <div class="auth__card-header">
          <h1 class="auth__card-header__title">Sign in</h1>
          <p class="auth__card-header__subtitle">Welcome back</p>
        </div>

        <FormComponent
          v-for="item in authFormItems"
          :key="item.key"
          :name="item.name"
          :type="item.type"
          :id="item.id"
          v-model="formData[item.key]"
          :has-error="!!error"
          @input="error = null"
        />

        <div v-if="error" class="auth__card-error">
          {{ error }}
        </div>

        <ButtonComponent :icon="LinkIcon" type="submit" />
      </form>
    </template>
  </MainLayout>
</template>

<style lang="scss">
@use './style' as *;
</style>
