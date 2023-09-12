<script setup>
import { ref } from "vue";
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
        <VListItem to="/mgmt/overview" title="Overview" />
        <VListItem to="/mgmt/content" title="Site Content" />
        <VListItem to="/mgmt/clubs" title="Clubs" />
        <VListItem to="/mgmt/filelist" title="Files (Reports)" />
        <VListItem to="/mgmt/interclubs" title="Interclubs" />
        <VListItem to="/mgmt/logout" title="Logout" />
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
