<template>
  <BaseModal
    :open="cart.isOpen"
    title="Your Cart"
    subtitle="Review your licenses before checkout."
    @close="cart.closeCart"
  >
    <div v-if="!cart.lines.length" class="text-center text-[12px] text-[color:var(--ink-muted)]">
      Your cart is empty.
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="line in cart.lines"
        :key="line.id"
        class="flex items-center justify-between rounded-2xl border border-[color:var(--line)] px-4 py-3"
      >
        <div>
          <p class="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink)]">
            {{ line.merchandise.product.title }}
          </p>
          <p class="mt-1 text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
            {{ line.merchandise.title }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-[12px] font-semibold text-[color:var(--ink)]">
            {{ formatPrice(line.merchandise.price) }}
          </span>
          <button
            class="text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-muted)]"
            @click="cart.removeLine(line.id)"
          >
            Remove
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-2 pt-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--ink-muted)]">
        <div class="flex items-center justify-between">
          <span>Total items: {{ cart.totalQuantity }}</span>
          <span>Subtotal: {{ subtotalLabel }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Total</span>
          <span class="text-[color:var(--ink)]">{{ subtotalLabel }}</span>
        </div>
        <div class="flex justify-end">
          <button
            class="rounded-full bg-[color:var(--accent)] px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white"
            :disabled="!cart.checkoutUrl"
            @click="goToCheckout"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'
import { useCartStore } from '~/stores/cart.store'

const cart = useCartStore()

const subtotal = computed(() => {
  return cart.lines.reduce((sum, line) => {
    const amount = Number(line.merchandise.price.amount)
    return sum + (Number.isFinite(amount) ? amount : 0)
  }, 0)
})

const currencyCode = computed(() => {
  return cart.lines[0]?.merchandise.price.currencyCode ?? 'USD'
})

const subtotalLabel = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.value
  }).format(subtotal.value)
})

const goToCheckout = () => {
  if (cart.checkoutUrl) {
    window.location.href = cart.checkoutUrl
  }
}

const formatPrice = (price: { amount: string; currencyCode: string }) => {
  const amount = Number(price.amount)
  if (!Number.isFinite(amount)) return `${price.amount} ${price.currencyCode}`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode
  }).format(amount)
}
</script>
