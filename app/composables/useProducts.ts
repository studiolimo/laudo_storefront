import type { ShopifyProduct } from '~/types/shopify'

export const useProducts = () => {
  const getProducts = async (first = 8): Promise<ShopifyProduct[]> => {
    return await $fetch<ShopifyProduct[]>('/api/shopify/products', {
      query: { first }
    })
  }

  return { getProducts }
}
