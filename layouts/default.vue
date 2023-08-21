<template>
  <v-app>
    <v-app-bar color="green-darken-2">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>
        FRBE- KBSB-KSB
      </v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer">
      <!-- <TheSideBar /> -->
    </v-navigation-drawer>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(null)
</script>

<script>
export default {
  data: () => ({drawer: null})
}
</script>
