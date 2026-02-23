export type LicenseVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
  licenseType: string
  tier: string
}

export type LicenseGroup = {
  type: string
  description?: string | null
  variants: LicenseVariant[]
}

type ProductLicenseResponse = {
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

const OPTION_LICENSE = 'License Type'
const OPTION_TIER = 'Tier'

const buildGroups = (data: ProductLicenseResponse): LicenseGroup[] => {
  const descriptions = new Map<string, string>()
  for (const field of data.metafields || []) {
    descriptions.set(field.key, field.value)
  }

  const groupsMap = new Map<string, LicenseGroup>()

  for (const variant of data.variants) {
    const licenseType = variant.selectedOptions.find((option) => option.name === OPTION_LICENSE)?.value ?? 'License'
    const tier = variant.selectedOptions.find((option) => option.name === OPTION_TIER)?.value ?? 'Standard'

    if (!groupsMap.has(licenseType)) {
      const key = licenseType.toLowerCase().replace(/\s+/g, '_')
      groupsMap.set(licenseType, {
        type: licenseType,
        description: descriptions.get(key) ?? null,
        variants: []
      })
    }

    groupsMap.get(licenseType)?.variants.push({
      id: variant.id,
      title: variant.title,
      availableForSale: variant.availableForSale,
      price: variant.price,
      licenseType,
      tier
    })
  }

  return Array.from(groupsMap.values())
}

export const useProductLicenses = () => {
  const getLicensesByHandle = async (handle: string): Promise<LicenseGroup[]> => {
    const data = await $fetch<ProductLicenseResponse>('/api/shopify/product', {
      query: { handle }
    })

    return buildGroups(data)
  }

  return { getLicensesByHandle }
}
