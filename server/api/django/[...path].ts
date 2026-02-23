export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.context.params?.path

  if (!path || !config.djangoBase) {
    throw createError({ statusCode: 500, statusMessage: 'Missing Django base URL or path' })
  }

  const joinedPath = Array.isArray(path) ? path.join('/') : path

  return await $fetch(`${config.djangoBase}/${joinedPath}`, {
    headers: {
      Authorization: `Bearer ${getCookie(event, 'token') ?? ''}`
    }
  })
})
