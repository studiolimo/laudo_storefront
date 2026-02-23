export type ShopifyImage = {
  url: string
  altText?: string | null
}

export type ShopifyProduct = {
  id: string
  handle: string
  title: string
  description?: string | null
  featuredImage?: ShopifyImage | null
  duration?: string | null
  character?: string | null
  previewUrl?: string | null
}

export type ShopifyCollection = {
  id: string
  handle: string
  title: string
  image?: ShopifyImage | null
}

export type ShopifyProductEdge = {
  node: ShopifyProduct
}

export type ShopifyCollectionEdge = {
  node: ShopifyCollection
}

export type ShopifyProductConnection = {
  edges: ShopifyProductEdge[]
}

export type ShopifyCollectionConnection = {
  edges: ShopifyCollectionEdge[]
}
