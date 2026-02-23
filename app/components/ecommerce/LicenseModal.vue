<template>
  <BaseModal
    :open="open"
    title="License Song"
    subtitle="Select the appropriate license and add it to your cart. Once you've gathered all of your licenses, continue to checkout."
    @close="emit('close')"
  >
    <div v-if="loading" class="text-center text-[12px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
      Loading licenses...
    </div>
    <div v-else-if="error" class="text-center text-[12px] text-red-500">
      {{ error }}
    </div>
    <div v-else class="space-y-4">
      <div v-if="notice" class="text-center text-[12px] text-[color:var(--accent)]">
        {{ notice }}
      </div>
      <div
        v-for="group in groups"
        :key="group.type"
        class="rounded-none bg-[color:var(--accent-soft)] px-4 py-3 text-[color:var(--ink)]"
      >
        <button
          class="flex w-full items-center justify-between text-left text-[12px] font-semibold uppercase tracking-[0.14em]"
          @click="toggle(group.type)"
        >
          <span>{{ group.type }}</span>
          <span class="text-[16px]">{{ activeGroup === group.type ? '−' : '+' }}</span>
        </button>
        <div v-if="activeGroup === group.type" class="mt-3 space-y-4 text-[12px] text-[color:var(--ink-muted)]">
          <p v-if="group.description" class="leading-relaxed">
            {{ group.description }}
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="variant in group.variants"
              :key="variant.id"
              class="license-button rounded-full border border-[color:var(--accent)] px-4 py-2 text-[11px] font-medium text-[color:var(--accent)] transition hover:bg-[color:var(--accent)] hover:text-white"
              :class="{
                'opacity-40 cursor-not-allowed': !variant.availableForSale,
                'bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent)]': cart.hasVariant(variant.id)
              }"
              :disabled="!variant.availableForSale || cart.hasVariant(variant.id)"
              @click="addVariant(variant)"
            >
              {{ cart.hasVariant(variant.id) ? 'Added' : `${variant.tier} · ${formatPrice(variant.price)}` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'
import { useProductLicenses, type LicenseGroup, type LicenseVariant } from '~/composables/useProductLicenses'
import { useCartStore } from '~/stores/cart.store'

const emit = defineEmits<{
  (event: 'close'): void
}>()

const props = defineProps<{ open: boolean; handle: string | null }>()

const { getLicensesByHandle } = useProductLicenses()
const cart = useCartStore()

const groups = ref<LicenseGroup[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const activeGroup = ref<string | null>(null)

const formatPrice = (price: { amount: string; currencyCode: string }) => {
  const amount = Number(price.amount)
  if (!Number.isFinite(amount)) return `${price.amount} ${price.currencyCode}`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode
  }).format(amount)
}

const load = async () => {
  if (!props.handle) return
  loading.value = true
  error.value = null
  try {
    groups.value = await getLicensesByHandle(props.handle)
    activeGroup.value = groups.value[0]?.type ?? null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load licenses'
  } finally {
    loading.value = false
  }
}

const toggle = (type: string) => {
  activeGroup.value = activeGroup.value === type ? null : type
}

const addVariant = async (variant: LicenseVariant) => {
  notice.value = null
  if (cart.hasVariant(variant.id)) {
    notice.value = 'This license is already in your cart.'
    return
  }
  await cart.addToCart(variant.id, 1)
  emit('close')
}

watch(
  () => [props.open, props.handle],
  ([isOpen, handle]) => {
    if (isOpen && handle) {
      notice.value = null
      load()
    }
  },
  { immediate: true }
)
</script>
