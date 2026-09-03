// https://nuxt.com/docs/api/configuration/nuxt-config
import { BRAND_DOCUMENT_TITLE, BRAND_DOCUMENT_DESCRIPTION } from './app/utils/brand'
import { staticPrerenderRoutes } from './server/data/staticCatalog'

const isStatic = process.env.NUXT_STATIC === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  css: [
    'vazirmatn/Vazirmatn-Variable-font-face.css',
    '@fontsource/markazi-text/arabic-400.css',
    '@fontsource/markazi-text/arabic-700.css',
    '@fontsource/cinzel/latin-400.css',
    '@fontsource/cinzel/latin-600.css'
  ],

  tailwindcss: {
    cssPath: '~/assets/css/main.css'
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      title: BRAND_DOCUMENT_TITLE,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: BRAND_DOCUMENT_DESCRIPTION }
      ]
    },
    ...(isStatic
      ? { baseURL: process.env.NUXT_APP_BASE_URL || '/Jeweley-project-DEMO/' }
      : {})
  },

  typescript: {
    strict: true
  },

  routeRules: isStatic
    ? {}
    : { '/admin/**': { ssr: false } },

  runtimeConfig: {
    // Public demo flags. Set DEMO_MODE=true to deploy the read-only public demo.
    public: {
      demo: process.env.DEMO_MODE === 'true',
      staticMode: process.env.NUXT_STATIC === 'true',
      demoUser: process.env.DEMO_ADMIN_USER || 'admin',
      demoPassword: process.env.DEMO_ADMIN_PASSWORD || ''
    }
  },

  // GitHub Pages static build (only when NUXT_STATIC=true, e.g. via the Actions
  // workflow). The full-stack Render build does not set NUXT_STATIC and is unchanged.
  ...(isStatic
    ? {
        nitro: {
          preset: 'github_pages',
          prerender: {
            crawlLinks: true,
            routes: staticPrerenderRoutes
          }
        }
      }
    : {})
})
