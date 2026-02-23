export const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        totalQuantity
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_QUERY = `#graphql
  query Cart($id: ID!) {
    cart(id: $id) {
      id
      totalQuantity
      checkoutUrl
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`

export const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`
