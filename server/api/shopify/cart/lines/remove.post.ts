import { createShopifyClient } from '~/services/shopify/client'
import { CART_LINES_REMOVE_MUTATION } from '~/services/shopify/queries/cart'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ cartId: string; lineIds: string[] }>(event)

  if (!body?.cartId || !body?.lineIds?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing cart id or line ids' })
  }

  const client = createShopifyClient()
  const data = await client.request<{
    cartLinesRemove: {
      cart: { id: string; totalQuantity: number; checkoutUrl: string } | null
      userErrors: Array<{ field?: string[]; message: string }>
    }
  }>(CART_LINES_REMOVE_MUTATION, { cartId: body.cartId, lineIds: body.lineIds })

  if (data.cartLinesRemove.userErrors?.length) {
    throw createError({ statusCode: 400, statusMessage: data.cartLinesRemove.userErrors[0]?.message })
  }

  if (!data.cartLinesRemove.cart) {
    throw createError({ statusCode: 500, statusMessage: 'Cart not updated' })
  }

  return data.cartLinesRemove.cart
})
