import { createShopifyClient } from '~/services/shopify/client'
import { PRODUCTS_QUERY } from '~/services/shopify/queries/products'
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
  const { first = '8' } = getQuery(event)
  const client = createShopifyClient()

  const data = await client.request<{ products: { edges: Array<{ node: ProductNode }> } }>(
    PRODUCTS_QUERY,
    { first: Number(first) }
  )

  return data.products.edges.map((edge) => normalizeProduct(edge.node))
})
