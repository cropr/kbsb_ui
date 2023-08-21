export default defineI18nConfig(() => {
  return {
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
  };
});
