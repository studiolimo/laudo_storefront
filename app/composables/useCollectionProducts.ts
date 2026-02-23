import type { ShopifyProduct } from '~/types/shopify'

export const useCollectionProducts = () => {
  const getCollectionProducts = async (handle: string, first = 8): Promise<ShopifyProduct[]> => {
    return await $fetch<ShopifyProduct[]>('/api/shopify/collection-products', {
      query: { handle, first }
    })
  }

  return { getCollectionProducts }
}
