import { createShopifyClient } from '~/services/shopify/client'
import { PRODUCT_LICENSE_BASE_QUERY, PRODUCT_LICENSE_METAFIELDS_QUERY } from '~/services/shopify/queries/product'

export type ProductLicenseResponse = {
  id: string
  handle: string
  title: string
  description?: string | null
  metafields: Array<{ key: string; value: string }>
  variants: Array<{
    id: string
    title: string
    availableForSale: boolean
    price: { amount: string; currencyCode: string }
    selectedOptions: Array<{ name: string; value: string }>
  }>
}

type ProductBaseResponse = Omit<ProductLicenseResponse, 'metafields'> & {
  metafields?: never
}

export default defineEventHandler(async (event) => {
  const { handle } = getQuery(event)
  if (!handle || typeof handle !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing product handle' })
  }

  const client = createShopifyClient()
  const baseData = await client.request<{ productByHandle: ProductBaseResponse | null }>(
    PRODUCT_LICENSE_BASE_QUERY,
    { handle }
  )

  if (!baseData.productByHandle) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const licenseTypes = new Set<string>()
  const variantNodes = baseData.productByHandle.variants?.nodes ?? []
  for (const variant of variantNodes) {
    const licenseType = variant.selectedOptions.find((option) => option.name === 'License Type')?.value
    if (licenseType) {
      licenseTypes.add(licenseType)
    }
  }

  const identifiers = Array.from(licenseTypes).map((type) => ({
    namespace: 'license',
    key: type.toLowerCase().replace(/\s+/g, '_')
  }))

  let metafields: Array<{ key: string; value: string }> = []
  if (identifiers.length) {
    const metaData = await client.request<{ productByHandle: { metafields: Array<{ key: string; value: string | null }> } | null }>(
      PRODUCT_LICENSE_METAFIELDS_QUERY,
      { handle, identifiers }
    )
    metafields = (metaData.productByHandle?.metafields ?? []).filter((field) => field?.value) as Array<{
      key: string
      value: string
    }>
  }

  return {
    ...baseData.productByHandle,
    variants: baseData.productByHandle.variants?.nodes ?? [],
    metafields
  }
})
