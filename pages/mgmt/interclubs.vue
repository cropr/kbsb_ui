<script setup>
import { ref, onMounted } from 'vue'
import { VContainer, VAutocomplete, VSelect, VBtn, VCard, VCardTitle, VCardText, VRow, 
  VCol, VDialog, VProgressCircular, VSnackbar, VTabs, VTab, VWindow,  VWindowItem} from 'vuetify/components';
import { Downloads, Playerlist, Results, Venue } from '@/components/mgmtinterclubs'

import { useMgmtTokenStore } from "@/store/mgmttoken";
import { usePersonStore } from "@/store/person"
import { storeToRefs } from 'pinia'
import { INTERCLUBS_ROUNDS } from '@/util/interclubs'

// idtoken
const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore) 
const personstore = usePersonStore();
const { person } = storeToRefs(personstore)

// communication with tabbed children
const tab = ref(null)
const refdownloads = ref(null)
const refplayerlist = ref(null)
const refresults = ref(null) 
const refvenues = ref(null) 
function changeTab(){
  console.log('changeTab', tab.value)
  switch (tab.value) {
    case 'downloads':
      refdownloads.value.setup()
      break
    case 'playerlist':
      refplayerlist.value.setup(icclub.value)
      break
    case 'results':
      refresults.value.setup(icclub.value, round.value)
      break
    case 'venues':
      refvenues.value.setup(icclub.value)
      break    
  }
}

// datamodel
const clubs = ref([])
const icclub = ref({})          // the icclub data
const idclub = ref(null)
const ic_rounds = Object.keys(INTERCLUBS_ROUNDS).map((x)=> {
  return {value: x, title: `R${x}: ${INTERCLUBS_ROUNDS[x]}`}
})
const round = ref("1")

// waiting dialog
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


// others
const localePath = useLocalePath()
const { $backend } = useNuxtApp()


// layout + header
definePageMeta({
  layout: 'mgmt'
})
useHead({
  script: [
    { src: 'https://accounts.google.com/gsi/client', defer: true }
  ],
  title: 'Management Clubs',    
})

// methods alphabetically

async function checkAuth() {
  if (mgmttoken.value) return 
  if (person.value.credentials.length === 0) {
    navigateTo(localePath('/mgmt'))
    return
  }
  if (!person.value.email.endsWith('@frbe-kbsb-ksb.be')) {
    navigateTo(localePath('/mgmt'))
    return
  }
  let reply
  // now login using the Google auth token
  changeDialogCounter(1)
  try {
    reply = await $backend("accounts", "login", {
      logintype: 'google',
      token: person.value.credentials,
      username: null,
      password: null,
    })
  }
  catch (error) {
    console.log('login not valid')
    navigateTo(localePath('/mgmt'))
  }
  finally {
    changeDialogCounter(-1)
  }
  mgmtstore.updateToken(reply.data)
}


async function getClubs() {
  let reply
  changeDialogCounter(1)
  try {
    reply = await $backend("club", "anon_get_clubs", {})
  } catch (error) {
    console.log('getClubs error')
    displaySnackbar(error.message)
    return
  }
  finally {
    changeDialogCounter(-1)
  }
  clubs.value = reply.data
  clubs.value.forEach(p => {
    p.merged = `${p.idclub}: ${p.name_short} ${p.name_long}`
  })
}

async function getClubDetails() {
  let reply
  icclub.value = {}
  if (idclub.value) {
    changeDialogCounter(1)
    try {
      reply = await $backend("interclub","mgmt_getICclub" ,{
        idclub: idclub.value,
        token: mgmttoken.value
      })
    } catch (error) {
      displaySnackbar(error.message)
      return
    } finally {
      changeDialogCounter(-1)
    }
    icclub.value = reply.data
    changeTab()
  }
  else {
    changeTab()
  }

}


function selectClub(){
  getClubDetails()
}

onMounted( () => {
  checkAuth()
  getClubs()
})
</script>

<template>
  <VContainer>
    <h1>Interclubs Manager</h1>
    <v-dialog width="10em" v-model="waitingdialog">
      <v-card>
        <v-card-title>Loading...</v-card-title>
        <v-card-text>
          <v-progress-circular indeterminate color="green" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-text>
        <v-row>
        <v-col cols="12" sm="6">
          <VAutocomplete v-model="idclub" :items="clubs" 
          item-title="merged" item-value="idclub" color="purple"
          label="Club" clearable @update:model-value="selectClub" >
        </VAutocomplete>
        </v-col>
        <v-col cols="12" sm="6">
          <VSelect v-model="round" :items="ic_rounds" label="Round" 
            @update:model-value="changeTab">
          </VSelect>
        </v-col>
      </v-row>
      </v-card-text>
    </v-card>
    <h3 class="mt-2">
      Selected club: {{ icclub.idclub }} {{ icclub.name }}
    </h3>
    <div class="elevation-2">
      <v-tabs v-model="tab" color="purple" @update:modelValue="changeTab" >
        <v-tab value="results">Results</v-tab>        
        <v-tab value="venues">Venues</v-tab>
        <v-tab value="playerlist">Player lists</v-tab>
        <v-tab value="downloads">Downloads</v-tab>   
      </v-tabs>
      <v-window v-model="tab" @update:modelValue="changeTab">
        <v-window-item value="results" :eager="true">
          <Results ref="refresults"
            @displaySnackbar="displaySnackbar"
            @changeDialogCounter="changeDialogCounter"          
          />
        </v-window-item>      
        <v-window-item value="venues" :eager="true">
          <Venue ref="refvenues" 
            @displaySnackbar="displaySnackbar"
            @changeDialogCounter="changeDialogCounter" 
          />
        </v-window-item>
        <v-window-item value="playerlist" :eager="true">
          <Playerlist ref="refplayerlist"
            @displaySnackbar="displaySnackbar"
            @changeDialogCounter="changeDialogCounter"
          />
        </v-window-item>
        <v-window-item value="downloads" :eager="true">
          <Downloads ref="refdownloads"
            :icclub="icclub" 
            :round="round"          
          />
        </v-window-item>
      </v-window>
    </div>
    <VSnackbar v-model="snackbar" timeout="6000">
      {{ errortext }}
      <template v-slot:actions>
        <v-btn color="green-lighten-2" variant="text" @click="snackbar = false" icon="mdi-close" />
      </template>
    </VSnackbar>     
  </VContainer>

</template>