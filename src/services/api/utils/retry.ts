import { AuthUserController } from '../controllers/auth/controller'

export async function withTokenRetry<T>(
  controller: any,
  func: () => Promise<T>,
  authStore: { logout: () => void },
  router: { replace: (path: string) => void },
): Promise<T> {
  try {
    return await func()
  } catch (err: any) {
    if (err instanceof Error && err.message.includes('HTTP 401')) {
      // Берем отдельный контроллер для refresh
      const authController = new AuthUserController()
      const tokenType = localStorage.getItem('token_type')
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        authStore.logout()
        router.replace('/')
        throw err
      }

      try {
        const tokens = await authController.refresh.post({
          refresh_token: refreshToken,
        })
        if (!tokens.access_token) throw new Error('Invalid refresh token')

        localStorage.setItem('access_token', tokens.access_token)

        // Обновляем заголовки у исходного контроллера
        controller.headers = {
          ...controller.headers,
          Authorization: `${tokenType} ${tokens.access_token}`,
        }
      } catch (refreshErr) {
        authStore.logout()
        router.replace('/')
        throw refreshErr
      }

      // Повторяем исходный метод
      return func()
    }

    throw err
  }
}
