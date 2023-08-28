// stores/counter.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useIdtokenStore = defineStore("idtoken", () => {
  const token = ref(null);
  function updateToken(newtoken) {
    console.log("Updating idtoken", newtoken);
    token.value = newtoken;
    // window.localStorage.setItem("idtoken", newtoken);
  }
  function startup() {
    console.log("startup idtoken store");
    if (!token.value) {
      token.value = window.localStorage.getItem("idtoken");
    }
  }
  return { token, updateToken, startup };
});
