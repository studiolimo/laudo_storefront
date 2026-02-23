// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-02-23',
  devtools: { enabled: true },
  ssr: true,
  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt'
  ],

  runtimeConfig: {
    shopify: {
      domain: process.env.SHOPIFY_DOMAIN,
      token: process.env.SHOPIFY_STOREFRONT_TOKEN
    },
    djangoBase: process.env.DJANGO_API_URL,
    public: {
      siteUrl: process.env.SITE_URL
    }
  },

  typescript: {
    strict: true
  }
})