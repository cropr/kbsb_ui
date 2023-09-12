// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app:{
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: '/css/kbsb.css'
        }
      ]
    }
  },
  build: {
    transpile: ['vuetify'],
  },
  content: {
    api: {
      baseURL: '/capi'
    }
  },
  css: [
    'vuetify/lib/styles/main.sass', 
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  experimental: {
    payloadExtraction: false
  },
  i18n: {
    lazy: true,
    locales: [
      { code: "nl", file: "nl.js" },
      { code: "fr", file: "fr.js" },
      { code: "de", file: "de.js" },
      { code: "en", file: "en.js" },
    ],
    langDir: "lang/",    
    strategy: "prefix",
    defaultLocale: "nl",
    vueI18n: './i18n.config.ts',
  },  
  modules: ['@nuxt/content', '@nuxtjs/i18n', '@pinia/nuxt'],
  nitro: {
    prerender: {
      crawlLinks: false,
      failOnError: false, 
    },
  },
  runtimeConfig: {
    public: {
      apiurl: process.env.API_URL || "http://localhost:8000/",
    }
  }  
})
