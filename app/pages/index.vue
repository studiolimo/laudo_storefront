<template>
  <div class="min-h-screen px-6 pb-24 pt-10 sm:px-10 lg:px-16">
    <AppContainer>
      <SiteHeader />
    </AppContainer>

    <AppContainer class="mt-12">
      <SectionTitle>Browse through our categories and find the perfect sound.</SectionTitle>
    </AppContainer>

    <AppContainer class="mt-8">
      <CategoryGrid :items="categoryTiles" :selected-id="selectedCollectionId" @select="onSelectCollection" />
    </AppContainer>

    <AppContainer class="mt-10">
      <SectionTitle>
        This is not a library but a resource of fine hand made music for brands, film directors and any image driven
        projects. Explore the fascinating relation between sound and images with this selection of songs ready to be licensed.
      </SectionTitle>
    </AppContainer>

    <AppContainer class="mt-10" ref="tracksSection">
      <TrackTable
        :tracks="trackRows"
        :selected-id="selectedTrackId"
        :playing-id="playingTrackId"
        @play="onPlayTrack"
        @license="onLicenseTrack"
        @select="onSelectTrack"
      />
    </AppContainer>

    <PlayerBar @license="onLicenseFromPlayer" />

    <LicenseModal :open="showLicenseModal" :handle="selectedHandle" @close="closeLicenseModal" />
    <CartModal />
  </div>
</template>

<script setup lang="ts">
import AppContainer from '~/components/ui/AppContainer.vue'
import SectionTitle from '~/components/ui/SectionTitle.vue'
import SiteHeader from '~/components/ecommerce/SiteHeader.vue'
import CategoryGrid from '~/components/ecommerce/CategoryGrid.vue'
import TrackTable from '~/components/ecommerce/TrackTable.vue'
import PlayerBar from '~/components/ecommerce/PlayerBar.vue'
import LicenseModal from '~/components/ecommerce/LicenseModal.vue'
import CartModal from '~/components/ecommerce/CartModal.vue'
import { usePlayerStore } from '~/stores/player.store'

import type { CategoryTile } from '~/components/ecommerce/CategoryGrid.vue'
import type { TrackRow } from '~/components/ecommerce/TrackTable.vue'

const fallbackCategories: CategoryTile[] = [
  { label: 'Subtle', tone: 'tile--subtle' },
  { label: 'Emotional', tone: 'tile--emotional' },
  { label: 'Ambient', tone: 'tile--ambient' },
  { label: 'Rhythmical', tone: 'tile--rhythmic' },
  { label: 'Experimental', tone: 'tile--experimental' },
  { label: 'Mysterious', tone: 'tile--mysterious' }
]

const fallbackTracks: TrackRow[] = [
  { id: '1', handle: 'carpet-den', title: 'Carpet Den', character: 'Sensitive, Soft, Elegant, Acoustic', duration: '1:49' },
  { id: '2', handle: 'paper-lanterns', title: 'Paper Lanterns', character: 'Tender, Warm, Intimate, Guitar', duration: '2:12' },
  { id: '3', handle: 'southbound', title: 'Southbound', character: 'Bright, Melodic, Hopeful, Piano', duration: '1:58' },
  { id: '4', handle: 'still-motion', title: 'Still Motion', character: 'Reflective, Sparse, Airy, Ambient', duration: '2:33' },
  { id: '5', handle: 'quiet-parade', title: 'Quiet Parade', character: 'Dreamy, Textural, Gentle, Synth', duration: '2:05' },
  { id: '6', handle: 'blue-orchard', title: 'Blue Orchard', character: 'Mellow, Organic, Calm, Strings', duration: '2:21' }
]

const tones = ['tile--subtle', 'tile--emotional', 'tile--ambient', 'tile--rhythmic', 'tile--experimental', 'tile--mysterious']

const { getCollections } = useCollections()
const { getProducts } = useProducts()
const { getCollectionProducts } = useCollectionProducts()

const route = useRoute()
const router = useRouter()

const selectedCollectionHandle = ref<string | null>(null)

const initSelectedCollection = () => {
  const fromQuery = typeof route.query.collection === 'string' ? route.query.collection : null
  if (fromQuery) {
    selectedCollectionHandle.value = fromQuery
    return
  }
  if (import.meta.client) {
    const stored = window.localStorage.getItem('selected_collection')
    if (stored) {
      selectedCollectionHandle.value = stored
    }
  }
}

initSelectedCollection()

watch(
  () => route.query.collection,
  (value) => {
    if (typeof value === 'string') {
      selectedCollectionHandle.value = value
    } else if (!value) {
      selectedCollectionHandle.value = null
    }
  }
)

watch(selectedCollectionHandle, (value) => {
  if (!import.meta.client) return
  if (value) {
    window.localStorage.setItem('selected_collection', value)
  } else {
    window.localStorage.removeItem('selected_collection')
  }
})

const { data: collections } = await useAsyncData('home-collections', () => getCollections(6))
const { data: products } = await useAsyncData('home-products', () => getProducts(8))
const { data: collectionProducts } = await useAsyncData(
  'collection-products',
  () => (selectedCollectionHandle.value ? getCollectionProducts(selectedCollectionHandle.value, 8) : Promise.resolve([])),
  { watch: [selectedCollectionHandle] }
)

const categoryTiles = computed<CategoryTile[]>(() => {
  const items = collections.value?.map((collection, index) => ({
    id: collection.id,
    handle: collection.handle,
    label: collection.title,
    tone: tones[index % tones.length],
    image: collection.image ?? null
  }))

  return items?.length ? items : fallbackCategories
})

const selectedCollectionId = computed(() => {
  if (!selectedCollectionHandle.value || !collections.value?.length) return null
  return collections.value.find((collection) => collection.handle === selectedCollectionHandle.value)?.id ?? null
})

const activeProducts = computed(() => {
  if (selectedCollectionHandle.value && collectionProducts.value?.length) {
    return collectionProducts.value
  }
  return products.value ?? []
})

const trackRows = computed<TrackRow[]>(() => {
  const items = activeProducts.value?.map((product) => ({
    id: product.id,
    handle: product.handle,
    title: product.title,
    character: product.character ?? 'Sensitive, Soft, Elegant, Acoustic',
    duration: product.duration ?? '—',
    previewUrl: product.previewUrl ?? null,
    image: product.featuredImage ?? null
  }))

  return items?.length ? items : fallbackTracks
})

const player = usePlayerStore()
const showLicenseModal = ref(false)
const selectedHandle = ref<string | null>(null)
const playingTrackId = computed(() => (player.isPlaying ? player.currentTrack?.id ?? null : null))

const onPlayTrack = (track: TrackRow) => {
  player.playTrack({
    id: track.id,
    handle: track.handle,
    title: track.title,
    duration: track.duration,
    previewUrl: track.previewUrl,
    image: track.image
  })
}

const onLicenseTrack = (track: TrackRow) => {
  selectedHandle.value = track.handle
  showLicenseModal.value = true
}

const selectedTrackId = ref<string | null>(null)

const onSelectTrack = (track: TrackRow) => {
  selectedTrackId.value = track.id
  player.setTrack({
    id: track.id,
    handle: track.handle,
    title: track.title,
    duration: track.duration,
    previewUrl: track.previewUrl,
    image: track.image
  })
}

const onLicenseFromPlayer = () => {
  const current = player.currentTrack
  if (!current?.handle) return
  selectedHandle.value = current.handle
  showLicenseModal.value = true
}

const tracksSection = ref<HTMLElement | null>(null)

const scrollToTracks = async () => {
  await nextTick()
  if (!import.meta.client) return
  if (window.innerWidth >= 768) return
  tracksSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const onSelectCollection = (collection: CategoryTile) => {
  if (!collection.handle) return
  const nextHandle = selectedCollectionHandle.value === collection.handle ? null : collection.handle
  selectedCollectionHandle.value = nextHandle
  router.replace({
    query: {
      ...route.query,
      collection: nextHandle || undefined
    }
  })
  if (nextHandle) {
    scrollToTracks()
  }
}

const closeLicenseModal = () => {
  showLicenseModal.value = false
}
</script>
