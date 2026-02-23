import { createShopifyClient } from '~/services/shopify/client'
import { CART_CREATE_MUTATION } from '~/services/shopify/queries/cart'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ lines: Array<{ merchandiseId: string; quantity: number }> }>(event)

  if (!body?.lines?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing cart lines' })
  }

  const client = createShopifyClient()
  const data = await client.request<{
    cartCreate: {
      cart: { id: string; totalQuantity: number; checkoutUrl: string } | null
      userErrors: Array<{ field?: string[]; message: string }>
    }
  }>(CART_CREATE_MUTATION, { lines: body.lines })

  if (data.cartCreate.userErrors?.length) {
    throw createError({ statusCode: 400, statusMessage: data.cartCreate.userErrors[0]?.message })
  }

  if (!data.cartCreate.cart) {
    throw createError({ statusCode: 500, statusMessage: 'Cart not created' })
  }

  return data.cartCreate.cart
})
