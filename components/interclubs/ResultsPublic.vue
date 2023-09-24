<script setup>
import { ref } from 'vue'
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

const { t } = useI18n()
const { $backend } = useNuxtApp()
const idclub = ref(null)
const icclubs = ref([])
const icseries = ref([])
const round = ref("1")
const ic_rounds = Object.keys(INTERCLUBS_ROUNDS).map((x)=> {
  return {value: x, title: `R${x}: ${INTERCLUBS_ROUNDS[x]}`}
})


async function getSeries(){
  let reply
  changeDialogCounter(1)
  console.log('getSeries', round.value, idclub.value)
  try {
    reply = await $backend("interclub","anon_getICseries", {
      round: round.value,
      idclub: idclub.value
    })
  } catch (error) {
    displaySnackbar(t(error.message))
    return
  }
  finally {
    changeDialogCounter(-1)
  }
  icseries.value = reply.data
}

async function getClubs() {
  let reply
  changeDialogCounter(1)
  try {
    reply = await $backend("interclub","anon_getICclubs", {})
  } catch (error) {
    displaySnackbar(t(error.message))
    return
  }
  finally {
    changeDialogCounter(-1)
  }
  icclubs.value = reply.data
  icclubs.value.forEach(p => {
    p.merged = `${p.idclub}: ${p.name}`
  })
}

function clubLabel(pairingnr, s) {
  let name = ""
  s.teams.forEach((t)=>{
    if (t.pairingnumber == pairingnr) {
      name = t.name
      return
    }
  })
  return name
}


onMounted(()=>{
  getClubs();
})



</script>

<template>
  <v-container>
    <h2>{{ $t('Results') }}</h2>
    <v-row>
      <v-col cols="12" sm="5">
        <VAutocomplete v-model="idclub" :items="icclubs" 
          item-title="merged" item-value="idclub" color="green"
          label="Club" clearable  >
        </VAutocomplete>        
      </v-col>
      <v-col cols="8" sm="5">
        <VSelect v-model="round" :items="ic_rounds" :label="t('Round')">
        </VSelect>
      </v-col>
      <v-col cols="4" sm="2">
        <VBtn icon="mdi-play" @click="getSeries"></VBtn>
      </v-col>
    </v-row>
    <v-card v-for="s in icseries" class="my-2">
      <v-card-title> 
        {{ t('Division') }} {{ s.division }}{{ s.index }}
        <VDivider />
      </v-card-title>
      <v-card-text>
        <v-row v-for="enc in s.rounds[0].encounters">
          <v-col cols="4">
            {{ enc.icclub_home}}: {{ clubLabel(enc.pairingnr_home, s) }}
          </v-col>
          <v-col cols="4">
            {{ enc.icclub_visit}}: {{ clubLabel(enc.pairingnr_visit, s) }}
          </v-col>
          <v-col cols="2">
            {{ enc.boardpoint2_home / 2 }} - {{ enc.boardpoint2_visit /2 }} 
          </v-col>
        </v-row>
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
