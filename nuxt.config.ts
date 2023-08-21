// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  css: [
    'vuetify/lib/styles/main.sass', 
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  modules: ['@nuxt/content', '@nuxtjs/i18n'],
  // vite: {
  //   define: {
  //     'process.env.DEBUG': false,
  //   },
  // },
})
