<template>
  <div v-if="player.currentTrack" class="player-bar fixed bottom-0 left-0 right-0">
    <div class="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-3 text-[11px] uppercase tracking-[0.16em] sm:px-10 lg:px-16">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 overflow-hidden rounded-lg bg-white/15">
          <img
            v-if="cover?.url"
            :src="cover.url"
            :alt="cover.altText ?? title"
            class="h-full w-full object-cover"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="font-medium">{{ title }}</span>
          <button
            class="mt-1 h-1 w-32 overflow-hidden rounded-full bg-white/20 md:hidden"
            type="button"
            @click="onWaveformClick"
          >
            <div class="h-full bg-white/80" :style="{ width: `${progress}%` }" />
          </button>
        </div>
      </div>
      <button
        class="rounded-full bg-white/20 px-3 py-1 text-[10px]"
        :disabled="!hasPreview"
        @click="toggle"
      >
        {{ isPlaying ? 'II' : '▶' }}
      </button>
      <div class="relative flex-1 max-md:hidden">
        <button
          class="relative h-10 w-full overflow-hidden"
          type="button"
          @click="onWaveformClick"
        >
          <canvas ref="waveformCanvas" class="h-full w-full" />
        </button>
      </div>
      <div class="flex items-center gap-3">
        <span>{{ currentTimeLabel }}</span>
        <span>/</span>
        <span>{{ totalTimeLabel }}</span>
      </div>
      <div class="ml-auto flex items-center gap-3">
        <div class="relative">
          <button class="rounded-full bg-white/15 p-2" @click="toggleVolume">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M4 10v4h4l5 4V6L8 10H4z" />
              <path d="M16 9c1.7 1.7 1.7 4.3 0 6" />
              <path d="M18.5 7.5c2.9 2.9 2.9 7.6 0 10.5" />
            </svg>
          </button>
          <div
            v-if="showVolume"
            class="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center rounded-full bg-black/60 px-2 py-3 backdrop-blur"
          >
            <input
              class="volume-slider h-24 w-4 appearance-none bg-transparent"
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="volume"
              @input="onVolumeInput"
              :style="{ '--vol': `${volumePercent}%` }"
            />
          </div>
        </div>
        <button class="rounded-full bg-white/15 px-3 py-1 text-[10px]" @click="emit('license')">License</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/player.store'

const emit = defineEmits<{
  (event: 'license'): void
}>()

const player = usePlayerStore()

const title = computed(() => player.currentTrack?.title ?? 'Select a track')
const cover = computed(() => player.currentTrack?.image ?? null)
const isPlaying = computed(() => player.isPlaying)
const currentTimeLabel = computed(() => player.currentTimeLabel)
const totalTimeLabel = computed(() => player.totalTimeLabel)
const volume = computed(() => player.volume)
const hasPreview = computed(() => Boolean(player.currentTrack?.previewUrl))
const progress = computed(() => {
  if (!player.totalTime) return 0
  return Math.min(100, Math.max(0, (player.currentTime / player.totalTime) * 100))
})

const toggle = () => player.toggle()
const onVolumeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  player.setVolume(Number(target.value))
}

const volumePercent = computed(() => Math.round((1 - volume.value) * 100))

const showVolume = ref(false)
const toggleVolume = () => {
  showVolume.value = !showVolume.value
}

const onWaveformClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLButtonElement
  const rect = target.getBoundingClientRect()
  const ratio = (event.clientX - rect.left) / rect.width
  player.seekTo(ratio)
}

const waveformCanvas = ref<HTMLCanvasElement | null>(null)

const setCanvasSize = () => {
  const canvas = waveformCanvas.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const width = Math.floor(canvas.clientWidth * dpr)
  const height = Math.floor(canvas.clientHeight * dpr)
  if (!width || !height) return
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
}

const drawWaveform = () => {
  const canvas = waveformCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  if (!width || !height) return

  ctx.clearRect(0, 0, width, height)

  const peaks = player.waveformPeaks
  if (!peaks.length) return

  const center = height / 2
  const max = Math.max(...peaks)
  const normalized = max > 0 ? peaks.map((value) => value / max) : peaks

  const progressX = Math.floor((progress.value / 100) * width)

  const barWidth = 1 * (window.devicePixelRatio || 1)
  const gap = 0.5 * (window.devicePixelRatio || 1)
  const bars = Math.floor(width / (barWidth + gap))
  const step = Math.max(1, Math.floor(normalized.length / bars))

  const draw = (color: string, limit?: number) => {
    ctx.fillStyle = color
    let x = 0
    for (let i = 0; i < normalized.length; i += step) {
      if (limit !== undefined && x > limit) break
      const amp = normalized[i] * (height * 0.9)
      const barHeight = Math.max(2, amp)
      const y = height - barHeight
      ctx.fillRect(x, y, barWidth, barHeight)
      x += barWidth + gap
    }
  }

  draw('rgba(255,255,255,0.35)')
  draw('rgba(255,255,255,0.9)', progressX)
}

let resizeObserver: ResizeObserver | null = null

watch(
  () => [player.waveformPeaks, progress.value, player.currentTrack?.id],
  () => drawWaveform(),
  { deep: true }
)

onMounted(() => {
  setCanvasSize()
  drawWaveform()
  if (waveformCanvas.value) {
    resizeObserver = new ResizeObserver(() => {
      setCanvasSize()
      drawWaveform()
    })
    resizeObserver.observe(waveformCanvas.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>
