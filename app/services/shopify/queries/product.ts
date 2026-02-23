export const PRODUCT_LICENSE_BASE_QUERY = `#graphql
  query ProductLicenseBase($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`

export const PRODUCT_LICENSE_METAFIELDS_QUERY = `#graphql
  query ProductLicenseMetafields($handle: String!, $identifiers: [HasMetafieldsIdentifier!]!) {
    productByHandle(handle: $handle) {
      metafields(identifiers: $identifiers) {
        key
        value
      }
    }
  }
`
