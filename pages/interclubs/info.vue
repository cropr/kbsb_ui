<script setup>
import { ref } from 'vue'
const tab = ref(null)
</script>

<template>
  <v-container>
    <h1>Interclubs 2023-24</h1>
    <v-tabs v-model="tab" color="green">
      <v-tab>{{ $t('Player list') }}</v-tab>
      <v-tab>{{ $t('Venues') }}</v-tab>
      <v-tab>{{ $t('Announcements') }}</v-tab>
      <v-tab>{{ $t('Dates') }}</v-tab>
      <!-- <v-tab>{{ $t('Results') }}</v-tab>
      <v-tab>{{ $t('Standings') }}</v-tab> -->
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item :eager="true">
        <InterclubsPlayerlistPublic />
      </v-window-item>      
      <v-window-item :eager="true">
        <InterclubsVenuePublic />
      </v-window-item>
      <v-window-item :eager="true">
        <InterclubsAnnouncements />
      </v-window-item>
      <v-window-item :eager="true">
        <InterclubsDates />
      </v-window-item>
    </v-window>
  </v-container>
</template>

