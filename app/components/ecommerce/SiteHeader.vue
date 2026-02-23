<template>
  <header class="flex w-full flex-col gap-2 text-xs tracking-[0.18em] text-[color:var(--ink-muted)]">
    <div class="flex items-start justify-between gap-6">
      <p class="text-[11px] font-medium tracking-[0.22em] text-[color:var(--ink)]">Laudo</p>
      <nav class="flex items-center gap-6 text-[10px]">
        <a class="transition hover:text-[color:var(--ink)]" href="#">Search</a>
        <button class="relative transition hover:text-[color:var(--ink)]" type="button" @click="cart.openCart">
          Cart ({{ cart.totalQuantity || 0 }})
        </button>
        <button class="transition hover:text-[color:var(--ink)]" type="button" @click="cycleTheme" aria-label="Toggle theme">
        <span v-if="themeLabel === 'light'" class="inline-flex items-center">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.6M12 18.9v2.6M4.3 4.3l1.8 1.8M17.9 17.9l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.3 19.7l1.8-1.8M17.9 6.1l1.8-1.8" />
          </svg>
        </span>
        <span v-else-if="themeLabel === 'dark'" class="inline-flex items-center">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 1 0 11.5 11.5Z" />
          </svg>
        </span>
        <span v-else class="inline-flex items-center">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="12" r="4.2" opacity="0.5" />
            <path d="M12 2.5v2.6M12 18.9v2.6M4.3 4.3l1.8 1.8M17.9 17.9l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.3 19.7l1.8-1.8M17.9 6.1l1.8-1.8" opacity="0.5" />
          </svg>
          <svg viewBox="0 0 24 24" class="-ml-1 h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 1 0 11.5 11.5Z" />
          </svg>
        </span>
        </button>
      </nav>
    </div>
    <p class="text-[10px]">
      <span class="block md:inline">Curated music</span>
      <span class="block md:inline"> for moving images</span>
    </p>
  </header>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart.store'

const cart = useCartStore()

const modes = ['auto', 'light', 'dark'] as const
type ThemeMode = (typeof modes)[number]

const theme = ref<ThemeMode>('auto')

const applyTheme = (mode: ThemeMode) => {
  if (!import.meta.client) return
  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }
  window.localStorage.setItem('theme_mode', mode)
}

const initTheme = () => {
  if (!import.meta.client) return
  const stored = window.localStorage.getItem('theme_mode') as ThemeMode | null
  if (stored && modes.includes(stored)) {
    theme.value = stored
  }
  applyTheme(theme.value)
}

const cycleTheme = () => {
  const index = modes.indexOf(theme.value)
  theme.value = modes[(index + 1) % modes.length]
  applyTheme(theme.value)
}

const themeLabel = computed(() => theme.value)

onMounted(() => {
  initTheme()
})
</script>
