import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthUserController } from '@/services/api/controllers/auth/controller'
import { AuthUserTokens, AuthUserCredentials } from '@/services/api/types'

export const useAuthStore = defineStore('auth', () => {
  const tokens = ref<AuthUserTokens>({
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token'),
    token_type: localStorage.getItem('token_type'),
  })

  const authUserController = new AuthUserController()

  const isAuthenticated = computed(() => !!tokens.value.access_token)

  function setTokens(dataTokens: AuthUserTokens) {
    tokens.value = { ...tokens.value, ...dataTokens }
    Object.entries(dataTokens).forEach(([key, value]) => {
      if (value !== null) localStorage.setItem(key, value)
    })
  }

  function clearTokens() {
    Object.keys(tokens.value).forEach((key) => {
      tokens.value[key as keyof AuthUserTokens] = null
      localStorage.removeItem(key)
    })
  }

  async function auth(data: AuthUserCredentials) {
    try {
      const response = await authUserController.auth.post({
        username: data.username,
        password: data.password,
      })
      setTokens(response)
      return response
    } catch (error) {
      throw error
    }
  }

  async function refresh() {
    if (!tokens.value.refresh_token || !isAuthenticated.value) return

    try {
      const response = await authUserController.refresh.post({
        refresh_token: tokens.value.refresh_token,
      })
      setTokens(response)
      return response
    } catch (error) {
      clearTokens()
      throw error
    }
  }

  function logout() {
    clearTokens()
  }

  return {
    tokens,
    isAuthenticated,
    auth,
    refresh,
    logout,
    setTokens,
    clearTokens,
  }
})
