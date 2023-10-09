import { createVuetify } from "vuetify";
import * as directives from "vuetify/directives";
import "vuetify/styles";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    directives,
  });

  nuxtApp.vueApp.use(vuetify);
});
