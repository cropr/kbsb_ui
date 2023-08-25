// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  css: [
    'vuetify/lib/styles/main.sass', 
    '@mdi/font/css/materialdesignicons.min.css'
  ],
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
  modules: ['@nuxt/content', '@nuxtjs/i18n'],
  // vite: {
  //   define: {
  //     'process.env.DEBUG': false,
  //   },
  // },
})
