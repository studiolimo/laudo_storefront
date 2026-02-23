import type { ShopifyCollection } from '~/types/shopify'

export const useCollections = () => {
  const getCollections = async (first = 6): Promise<ShopifyCollection[]> => {
    return await $fetch<ShopifyCollection[]>('/api/shopify/collections', {
      query: { first }
    })
  }

  return { getCollections }
}
