<script setup>
import { ref } from 'vue'
import { VContainer, VCard, VCardTitle, VCardText, VDivider, 
  VDialog, VProgressCircular} from 'vuetify/lib/components/index.mjs';

import { INTERCLUBS_ROUNDS, PLAYERS_DIVISION} from '@/util/interclubs'

// waiting
const waitingdialog = ref(false)
let dialogcounter = 0
function changeDialogCounter(i) {
    dialogcounter += i
    waitingdialog.value = (dialogcounter > 0)
}

// snackbar
const errortext = ref(null)
const snackbar = ref(null)
function displaySnackbar(text, color) {
  errortext.value = text
  snackbar.value = true
}

// datamodel
const { t } = useI18n()
const { $backend } = useNuxtApp()
const icseries = ref([])
async function getStandings() {

}

onMounted(()=>{
  getStandings();
})

</script>

<template>
  <v-container>
    <h2>{{ $t('Standings') }}</h2>
    <v-card v-for="s in icseries" class="my-2">
      <v-card-title> 
        {{ t('Division') }} {{ s.division }}{{ s.index }}
        <VDivider />
      </v-card-title>
      <v-card-text>
        TODO
      </v-card-text>
    </v-card>
    <v-dialog width="10em" v-model="waitingdialog">
      <v-card>
        <v-card-title>{{ $t('Loading...')}}</v-card-title>
        <v-card-text>
          <v-progress-circular indeterminate color="green" />
        </v-card-text>
      </v-card>
    </v-dialog> 
  </v-container>
</template>
