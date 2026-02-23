<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <article v-for="item in items" :key="item.id || item.label" class="flex flex-col gap-3">
      <button
        class="tile shadow-[0_20px_45px_rgba(0,0,0,0.12)] aspect-[5/4] w-full text-left transition rounded-none"
        :class="[
          item.tone,
          item.id === selectedId ? 'ring-2 ring-[color:var(--accent)]' : ''
        ]"
        type="button"
        @click="emit('select', item)"
      >
        <img
          v-if="item.image?.url"
          :src="item.image.url"
          :alt="item.image.altText ?? item.label"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div v-if="item.image?.url" class="absolute inset-0 bg-black/15" />
      </button>
      <p class="text-[11px] uppercase tracking-[0.16em] text-[color:var(--ink-muted)]">
        {{ item.label }}
      </p>
    </article>
  </div>
</template>

<script setup lang="ts">
export type CategoryTile = {
  id?: string
  handle?: string
  label: string
  tone?: string
  image?: { url: string; altText?: string | null } | null
}

const emit = defineEmits<{
  (event: 'select', item: CategoryTile): void
}>()

defineProps<{ items: CategoryTile[]; selectedId?: string | null }>()
</script>
