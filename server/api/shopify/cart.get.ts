import { createShopifyClient } from '~/services/shopify/client'
import { CART_QUERY } from '~/services/shopify/queries/cart'

export default defineEventHandler(async (event) => {
  const { cartId } = getQuery(event)
  if (!cartId || typeof cartId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing cart id' })
  }

  const client = createShopifyClient()
  const data = await client.request<{
    cart: {
      id: string
      totalQuantity: number
      checkoutUrl: string
      lines: {
        edges: Array<{
          node: {
            id: string
            quantity: number
            merchandise: {
              id: string
              title: string
              price: { amount: string; currencyCode: string }
              product: { title: string; handle: string }
            }
          }
        }>
      }
    } | null
  }>(CART_QUERY, { id: cartId })

  if (!data.cart) {
    throw createError({ statusCode: 404, statusMessage: 'Cart not found' })
  }

  return {
    ...data.cart,
    lines: data.cart.lines.edges.map((edge) => edge.node)
  }
})
