<template>
  <div>
    <div class="flex items-center justify-between border-b border-[color:var(--line)] pb-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">
      <span>{{ title }}</span>
    </div>

    <div class="mt-3 divide-y divide-[color:var(--line)]">
      <div
        v-for="track in tracks"
        :key="track.id"
        class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 rounded-lg px-2 py-3 text-[12px] text-[color:var(--ink-muted)] transition cursor-pointer"
        :class="{
          'bg-[color:var(--accent-soft)] text-[color:var(--ink)]': track.id === selectedId,
          'ring-1 ring-[color:var(--accent)]': track.id === playingId
        }"
        @click="emit('select', track)"
      >
        <div class="flex items-center gap-4">
          <div class="relative h-12 w-12 overflow-hidden rounded-lg bg-[color:var(--surface-muted)]">
            <img
              v-if="track.image?.url"
              :src="track.image.url"
              :alt="track.image.altText ?? track.title"
              class="h-full w-full object-cover"
            />
            <div class="absolute inset-0 bg-black/35" />
            <button
              class="absolute inset-0 flex items-center justify-center text-[10px] text-white transition hover:text-white/80"
              :class="{ 'opacity-40 cursor-not-allowed': !track.previewUrl }"
              :disabled="!track.previewUrl"
              @click.stop="emit('play', track)"
            >
              ▶
            </button>
          </div>
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--ink)]">
              {{ track.title }}
            </p>
            <p class="mt-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
              {{ track.character }}
            </p>
          </div>
        </div>
        <span class="text-[10px] uppercase tracking-[0.16em]">{{ track.duration }}</span>
        <button
          class="text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink)]"
          @click.stop="emit('license', track)"
        >
          License
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type TrackRow = {
  id: string
  handle: string
  title: string
  character: string
  duration: string
  previewUrl?: string | null
  image?: { url: string; altText?: string | null } | null
}

const emit = defineEmits<{
  (event: 'play', track: TrackRow): void
  (event: 'license', track: TrackRow): void
  (event: 'select', track: TrackRow): void
}>()

withDefaults(defineProps<{ title?: string; tracks: TrackRow[]; selectedId?: string | null; playingId?: string | null }>(), {
  title: 'Recently added'
})
</script>
