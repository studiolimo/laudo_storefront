import { defineStore } from 'pinia'

export type PlayerTrack = {
  id: string
  handle: string
  title: string
  duration: string
  previewUrl?: string | null
  image?: { url: string; altText?: string | null } | null
}

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref<PlayerTrack | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const totalTime = ref(0)
  const volume = ref(0.8)
  const waveformPeaks = ref<number[]>([])
  const waveformLoading = ref(false)

  let audio: HTMLAudioElement | null = null
  let waveformController: AbortController | null = null

  const ensureAudio = () => {
    if (!import.meta.client) return null
    if (!audio) {
      audio = new Audio()
      audio.preload = 'metadata'
      audio.volume = volume.value
      audio.addEventListener('timeupdate', () => {
        currentTime.value = audio?.currentTime ?? 0
      })
      audio.addEventListener('loadedmetadata', () => {
        totalTime.value = audio?.duration ?? 0
      })
      audio.addEventListener('ended', () => {
        isPlaying.value = false
      })
    }
    return audio
  }

  const playTrack = async (track: PlayerTrack) => {
    const player = ensureAudio()
    if (!player || !track.previewUrl) return

    if (currentTrack.value?.id !== track.id) {
      currentTrack.value = track
      player.src = track.previewUrl
      await loadWaveform(track.previewUrl)
    }

    await player.play()
    isPlaying.value = true
  }

  const setTrack = (track: PlayerTrack) => {
    currentTrack.value = track
    const player = ensureAudio()
    if (player && track.previewUrl) {
      player.src = track.previewUrl
    }
    isPlaying.value = false
    if (track.previewUrl) {
      loadWaveform(track.previewUrl)
    }
  }

  const loadWaveform = async (url: string) => {
    if (!import.meta.client) return
    waveformController?.abort()
    waveformController = new AbortController()
    waveformLoading.value = true
    waveformPeaks.value = []

    try {
      const response = await fetch(url, { signal: waveformController.signal })
      const arrayBuffer = await response.arrayBuffer()
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const context = new AudioCtx()
      const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0))
      const channelData = audioBuffer.getChannelData(0)
      const samples = 120
      const blockSize = Math.floor(channelData.length / samples)
      const peaks: number[] = []
      for (let i = 0; i < samples; i += 1) {
        let sum = 0
        const start = i * blockSize
        const end = Math.min(start + blockSize, channelData.length)
        for (let j = start; j < end; j += 1) {
          sum += Math.abs(channelData[j])
        }
        peaks.push(sum / (end - start || 1))
      }
      waveformPeaks.value = peaks
      context.close()
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        waveformPeaks.value = []
      }
    } finally {
      waveformLoading.value = false
    }
  }

  const seekTo = (ratio: number) => {
    const player = ensureAudio()
    if (!player || !Number.isFinite(player.duration)) return
    const clamped = Math.min(1, Math.max(0, ratio))
    player.currentTime = player.duration * clamped
    currentTime.value = player.currentTime
  }

  const toggle = async () => {
    const player = ensureAudio()
    if (!player) return

    if (isPlaying.value) {
      player.pause()
      isPlaying.value = false
      return
    }

    if (!currentTrack.value?.previewUrl) return
    await player.play()
    isPlaying.value = true
  }

  const setVolume = (value: number) => {
    volume.value = value
    if (audio) {
      audio.volume = value
    }
  }

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time <= 0) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const currentTimeLabel = computed(() => formatTime(currentTime.value))
  const totalTimeLabel = computed(() => formatTime(totalTime.value))

  return {
    currentTrack,
    isPlaying,
    currentTime,
    totalTime,
    volume,
    waveformPeaks,
    waveformLoading,
    currentTimeLabel,
    totalTimeLabel,
    playTrack,
    setTrack,
    seekTo,
    toggle,
    setVolume
  }
})
