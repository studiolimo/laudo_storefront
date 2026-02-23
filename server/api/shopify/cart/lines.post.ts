import { createShopifyClient } from '~/services/shopify/client'
import { CART_LINES_ADD_MUTATION } from '~/services/shopify/queries/cart'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ cartId: string; lines: Array<{ merchandiseId: string; quantity: number }> }>(event)

  if (!body?.cartId || !body?.lines?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing cart id or lines' })
  }

  const client = createShopifyClient()
  const data = await client.request<{
    cartLinesAdd: {
      cart: { id: string; totalQuantity: number; checkoutUrl: string } | null
      userErrors: Array<{ field?: string[]; message: string }>
    }
  }>(CART_LINES_ADD_MUTATION, { cartId: body.cartId, lines: body.lines })

  if (data.cartLinesAdd.userErrors?.length) {
    throw createError({ statusCode: 400, statusMessage: data.cartLinesAdd.userErrors[0]?.message })
  }

  if (!data.cartLinesAdd.cart) {
    throw createError({ statusCode: 500, statusMessage: 'Cart not updated' })
  }

  return data.cartLinesAdd.cart
})
