// dynamicController.ts
const controllerModules = import.meta.glob(
  '@/services/api/controllers/**/controller.ts',
)

export async function useDynamicController(title: string) {
  const token = localStorage.getItem('access_token')
  const tokenType = localStorage.getItem('token_type')

  const key = `/src/services/api/controllers/${title}/controller.ts`

  const moduleLoader = controllerModules[key]

  if (!moduleLoader) {
    throw new Error(`Controller not found for: ${title}`)
  }

  const module: any = await moduleLoader()
  const ControllerClass =
    module.default || module[`${capitalize(title)}Controller`]

  return new ControllerClass({
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  })
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
