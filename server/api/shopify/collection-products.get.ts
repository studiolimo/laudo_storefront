import { createShopifyClient } from '~/services/shopify/client'
import { COLLECTION_PRODUCTS_QUERY } from '~/services/shopify/queries/collection-products'
import type { ShopifyProduct } from '~/types/shopify'

type ProductNode = ShopifyProduct & {
  duration?: { value?: string | null } | null
  character?: { value?: string | null } | null
  previewUrl?: { value?: string | null } | null
  images?: { nodes: Array<{ url: string; altText?: string | null }> }
}

const normalizeProduct = (product: ProductNode): ShopifyProduct => ({
  ...product,
  duration: product.duration?.value ?? null,
  character: product.character?.value ?? null,
  previewUrl: product.previewUrl?.value ?? null,
  featuredImage: product.featuredImage ?? product.images?.nodes?.[0] ?? null
})

export default defineEventHandler(async (event) => {
  const { handle, first = '8' } = getQuery(event)
  if (!handle || typeof handle !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing collection handle' })
  }

  const client = createShopifyClient()
  const data = await client.request<{
    collectionByHandle: {
      products: { edges: Array<{ node: ProductNode }> }
    } | null
  }>(COLLECTION_PRODUCTS_QUERY, {
    handle,
    first: Number(first)
  })

  if (!data.collectionByHandle) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
  }

  return data.collectionByHandle.products.edges.map((edge) => normalizeProduct(edge.node))
})
