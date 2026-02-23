import { defineStore } from 'pinia'

type CartLine = {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    price: { amount: string; currencyCode: string }
    product: { title: string; handle: string }
  }
}

export const useCartStore = defineStore('cart', () => {
  const cartId = useCookie<string | null>('cart_id', { sameSite: 'lax' })
  const id = ref<string | null>(cartId.value ?? null)
  const totalQuantity = ref(0)
  const lines = ref<CartLine[]>([])
  const checkoutUrl = ref<string | null>(null)
  const isOpen = ref(false)

  if (process.client && !id.value) {
    const stored = window.localStorage.getItem('cart_id')
    if (stored) {
      id.value = stored
      cartId.value = stored
    }
  }

  watch(id, (value) => {
    if (!process.client) return
    if (value) {
      window.localStorage.setItem('cart_id', value)
    } else {
      window.localStorage.removeItem('cart_id')
    }
  })

  const setCartId = (value: string | null) => {
    id.value = value
    cartId.value = value
  }

  const fetchCart = async () => {
    if (!id.value) return
    const cart = await $fetch<{ id: string; totalQuantity: number; checkoutUrl: string; lines: CartLine[] }>(
      '/api/shopify/cart',
      {
        query: { cartId: id.value }
      }
    )
    totalQuantity.value = cart.totalQuantity
    checkoutUrl.value = cart.checkoutUrl
    lines.value = cart.lines
  }

  const addToCart = async (variantId: string, quantity = 1) => {
    const existing = lines.value.find((line) => line.merchandise.id === variantId)
    if (existing) {
      await openCart()
      return
    }

    const linesPayload = [{ merchandiseId: variantId, quantity }]

    if (!id.value) {
      const cart = await $fetch<{ id: string; totalQuantity: number; checkoutUrl: string }>('/api/shopify/cart', {
        method: 'POST',
        body: { lines: linesPayload }
      })
      setCartId(cart.id)
      checkoutUrl.value = cart.checkoutUrl
    } else {
      const cart = await $fetch<{ id: string; totalQuantity: number; checkoutUrl: string }>('/api/shopify/cart/lines', {
        method: 'POST',
        body: { cartId: id.value, lines: linesPayload }
      })
      totalQuantity.value = cart.totalQuantity
      checkoutUrl.value = cart.checkoutUrl
    }

    await fetchCart()
    openCart()
  }

  const removeLine = async (lineId: string) => {
    if (!id.value) return
    const cart = await $fetch<{ id: string; totalQuantity: number; checkoutUrl: string }>(
      '/api/shopify/cart/lines/remove',
      {
        method: 'POST',
        body: { cartId: id.value, lineIds: [lineId] }
      }
    )
    totalQuantity.value = cart.totalQuantity
    checkoutUrl.value = cart.checkoutUrl
    await fetchCart()
  }

  const openCart = async () => {
    isOpen.value = true
    await fetchCart()
  }

  const closeCart = () => {
    isOpen.value = false
  }

  const hasVariant = (variantId: string) => {
    return lines.value.some((line) => line.merchandise.id === variantId)
  }

  return {
    id,
    totalQuantity,
    lines,
    checkoutUrl,
    isOpen,
    fetchCart,
    addToCart,
    removeLine,
    openCart,
    closeCart,
    hasVariant
  }
})
