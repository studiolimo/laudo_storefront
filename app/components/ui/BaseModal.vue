<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60" @click="emit('close')" />
      <div class="glass-card relative z-10 w-[92vw] max-w-3xl rounded-2xl p-6 shadow-2xl">
        <button
          class="absolute right-4 top-4 text-[18px] text-[color:var(--ink-muted)]"
          type="button"
          @click="emit('close')"
        >
          ×
        </button>
        <div class="text-center">
          <h2 class="text-lg font-semibold text-[color:var(--ink)]">
            {{ title }}
          </h2>
          <p v-if="subtitle" class="mt-2 text-[12px] text-[color:var(--ink-muted)]">
            {{ subtitle }}
          </p>
        </div>
        <div class="mt-6">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: 'close'): void
}>()

defineProps<{ open: boolean; title: string; subtitle?: string }>()
</script>
