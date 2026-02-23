import { createShopifyClient } from '~/services/shopify/client'
import { COLLECTIONS_QUERY } from '~/services/shopify/queries/collections'
import type { ShopifyCollection } from '~/types/shopify'

export default defineEventHandler(async (event) => {
  const { first = '6' } = getQuery(event)
  const client = createShopifyClient()

  const data = await client.request<{ collections: { edges: Array<{ node: ShopifyCollection }> } }>(
    COLLECTIONS_QUERY,
    { first: Number(first) }
  )

  return data.collections.edges.map((edge) => edge.node)
})
