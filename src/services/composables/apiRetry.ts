import { ref, watchEffect, unref } from 'vue'
import { useRouter } from 'vue-router'
import useAuthStore from '@/app/providers/stores'
import { withTokenRetry } from '../api/utils'

export function useController<T>(
  controllerOrRef: any, // может быть объект или ref
  method: (controller: any) => Promise<T>,
  cacheKey?: string,
) {
  const data = ref<T | null>(null)
  const router = useRouter()
  const authStore = useAuthStore()

  watchEffect(async () => {
    const controller = unref(controllerOrRef) // достаем значение, даже если это ref
    if (!controller) return

    if (cacheKey) {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        data.value = JSON.parse(cached)
      }
    }

    try {
      const response = await withTokenRetry(
        controller,
        () => method(controller),
        authStore,
        router,
      )
      data.value = response
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify(response))
      }
    } catch (err) {
      console.error(err)
    }
  })

  return data
}
