export default {
  axios: {
    proxy: true,
  },

  build: {
    extend(config, { loaders }) {
      config.module.rules.push({
        test: /\.ya?ml$/,
        type: "json", // Required by Webpack v4
        use: "yaml-loader",
      });
    },
  },

  buildModules: ["@nuxtjs/vuetify"],

  components: true,

  head: {
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Material+Icons",
      },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css",
      },
    ],
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
    ],
    titleTemplate: "%s | KBSB-FRBE-KSB",
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
    vueI18n: {
      silentTranslationWarn: false,
      silentFallbackWarn: false,
    },
  },

  modules: [
    "@nuxtjs/axios",
    "@nuxtjs/i18n",
    "@nuxt/content",
    ["nuxt-vuex-localstorage", { localStorage: ["token"] }],
  ],

  plugins: [{ src: "~plugins/api", ssr: false }],

  proxy: {
    "/api/": "http://localhost:8000",
  },

  publicRuntimeConfig: {
    axios: {
      browserBaseURL: process.env.BROWSER_BASE_URL,
    },
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    statamic_url: process.env.STATAMIC_URL,
    repo_branch: process.env.REPO_BRANCH,
  },

  target: "static",

  vuetify: {
    // customVariables: ['~/assets/variables.scss'],
    theme: {
      light: true,
    },
  },
};
