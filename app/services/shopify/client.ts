import type { ShopifyCollectionConnection, ShopifyProductConnection } from '~/types/shopify'

const API_VERSION = '2024-01'

type ShopifyResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

export const createShopifyClient = () => {
  const config = useRuntimeConfig()
  const domain = config.shopify.domain?.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const token = config.shopify.token

  if (!domain || !token) {
    throw new Error('Missing Shopify domain or token in runtimeConfig.shopify')
  }

  const endpoint = `https://${domain}/api/${API_VERSION}/graphql.json`

  const request = async <T>(query: string, variables?: Record<string, unknown>) => {
    const response = await $fetch<ShopifyResponse<T>>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token
      },
      body: { query, variables }
    })

    if (response.errors?.length) {
      throw new Error(response.errors.map((error) => error.message).join(', '))
    }

    if (!response.data) {
      throw new Error('Empty response from Shopify API')
    }

    return response.data
  }

  return { request }
}

export type ShopifyCollectionsQuery = {
  collections: ShopifyCollectionConnection
}

export type ShopifyProductsQuery = {
  products: ShopifyProductConnection
}
