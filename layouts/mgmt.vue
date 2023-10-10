<script setup>
import { ref } from "vue";
import { VApp, VAppBar, VAppBarTitle, VNavigationDrawer, 
  VAppBarNavIcon, VMain, VList, VListItem, VToolbar, VToolbarTitle } from 'vuetify/components'
const drawer = ref(false);
const localePath = useLocalePath();
</script>

<template>
  <VApp>
    <VNavigationDrawer model="drawer" class="bg-deep-purple-darken-1 text-white">
      <VToolbar class="bg-deep-purple-lighten-1 text-white">
        <VToolbarTitle>Menu</VToolbarTitle>
      </VToolbar>
      <VList class="bg-deep-purple-lighten-1 text-white">
        <VListItem :to="localePath('/mgmt/overview')" title="Overview" />
        <VListItem :to="localePath('/mgmt/content')" title="Site Content" />
        <VListItem :to="localePath('/mgmt/clubs')" title="Clubs" />
        <VListItem :to="localePath('/mgmt/filelist')" title="Files (Reports)" />
        <VListItem :to="localePath('/mgmt/interclubs')" title="Interclubs" />
        <VListItem :to="localePath('/mgmt/logout')" title="Logout" />
      </VList>
    </VNavigationDrawer>
    <VAppBar class="bg-deep-purple-darken-1 text-white">
      <VAppBarNavIcon @click="drawer = !drawer" />
      <VAppBarTitle> Management FRBE- KBSB-KSB </VAppBarTitle>
    </VAppBar>
    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>
