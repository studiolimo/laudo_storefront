export const COLLECTION_PRODUCTS_QUERY = `#graphql
  query CollectionProducts($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            featuredImage {
              url
              altText
            }
            images(first: 1) {
              nodes {
                url
                altText
              }
            }
            duration: metafield(namespace: "track", key: "duration") {
              value
            }
            character: metafield(namespace: "track", key: "character") {
              value
            }
            previewUrl: metafield(namespace: "track", key: "preview_url") {
              value
            }
          }
        }
      }
    }
  }
`
