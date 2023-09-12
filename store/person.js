import { defineStore } from "pinia";
import { ref } from "vue";

export const usePersonStore = defineStore("pertson", () => {
  const person = ref({
    credentials: "",
    user: "",
    email: "",
  });
  function updatePerson(p) {
    person.value = p;
  }
  return { person, updatePerson };
});
