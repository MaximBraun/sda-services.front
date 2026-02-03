export const mappingController = {
  pixverse: async () => (await import('../api/controllers/pixverse')).default,
  chatgpt: async () => (await import('../api/controllers/chatgpt')).default,
}
