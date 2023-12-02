<script setup>
import { ref, onMounted } from 'vue'
import { VContainer, VAutocomplete, VSelect, VBtn, VCard, VCardTitle, VCardText, VRow, 
  VCol, VDialog, VProgressCircular, VSnackbar, VTabs, VTab, VWindow,  VWindowItem} from 'vuetify/components';
import { Downloads, Playerlist, Results, Venue } from '@/components/mgmtinterclubs'
import ProgressLoading from '@/components/ProgressLoading.vue'
import SnackbarMessage from '@/components/SnackbarMessage.vue'

import { INTERCLUBS_ROUNDS } from '@/util/interclubs'
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { usePersonStore } from "@/store/person"
import { storeToRefs } from 'pinia'

// stores
const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore) 
const personstore = usePersonStore();
const { person } = storeToRefs(personstore)

//  snackbar and loading widgets
const refsnackbar = ref(null)
let showSnackbar
const refloading = ref(null)
let showLoading

// datamodel
const clubs = ref([])
const icclub = ref({})          // the icclub data
const idclub = ref(null)
const club = ref(null)          // the mgmt club details 
const ic_rounds = Object.keys(INTERCLUBS_ROUNDS).map((x)=> {
  return {value: x, title: `R${x}: ${INTERCLUBS_ROUNDS[x]}`}
})
const round = ref("1")

// communication
const { $backend } = useNuxtApp()
const tab = ref(null)
const refdownloads = ref(null)
const refplayerlist = ref(null)
const refresults = ref(null) 
const refvenues = ref(null) 
function changeTab(){
  console.log('changeTab', tab.value)
  switch (tab.value) {
    case 'downloads':
      refdownloads.value.updateClub(icclub.value)
      refdownloads.value.updateRound(round.value)
      break
    case 'playerlist':
      refplayerlist.value.updateClub(icclub.value)
      break
    case 'results':
      refresults.value.updateClub(icclub.value)
      refresults.value.updateRound(round.value)
      break
    case 'venues':
      refvenues.value.updateClub(icclub.value)
      break    
  }
}


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
  console.log('checking if auth is already set', mgmttoken.value)
  if (mgmttoken.value) return 
  if (person.value.credentials.length === 0) {
    navigateTo('/mgmt')
    return
  }
  if (!person.value.email.endsWith('@frbe-kbsb-ksb.be')) {
    navigateTo('/mgmt')
    return
  }
  let reply
  showLoading(true)
  // now login using the Google auth token
  try {
    reply = await $backend("accounts", "login", {
      logintype: 'google',
      token: person.value.credentials,
      username: null,
      password: null,
    })
  }
  catch (error) {
    navigateTo('/mgmt')
  }
  finally {
    showLoading(false)
  }
  mgmtstore.updateToken(reply.data)
}

async function getClubs() {
  let reply
  showLoading(true)
  try {
    reply = await $backend("club", "anon_get_clubs", {})
  } catch (error) {
    console.log('getClubs error')
    showSnackbar(error.message)
    return
  }
  finally {
    showLoading(false)
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
    showLoading(true)
    try {
      reply = await $backend("interclub","mgmt_getICclub" ,{
        idclub: idclub.value,
        token: mgmttoken.value
      })
    } catch (error) {
      showSnackbar(error.message)
      return
    } finally {
      showLoading(false)
    }
    icclub.value = reply.data
  }
  refdownloads.value.updateClub(icclub.value)
  refplayerlist.value.updateClub(icclub.value)
  refresults.value.updateClub(icclub.value)
  refvenues.value.updateClub(icclub.value)   
}

function onPlayerlistUpdated(){
  console.log('player list updated')
}

function selectClub(){
  getClubDetails()
}

function selectRound(){
  refdownloads.value.updateRound(round.value)  
  refresults.value.updateRound(round.value)  
}

// triggers

onMounted( () => {
  showSnackbar = refsnackbar.value.showSnackbar
  showLoading = refloading.value.showLoading  
  checkAuth()
  getClubs()
  selectRound()
})


</script>

<template>
  <VContainer>
    <SnackbarMessage ref="refsnackbar" />
    <ProgressLoading ref="refloading"/>
    <h1>Interclubs Manager</h1>
    <VCard>
      <VCardText>
        <VRow>
          <VCol cols="12" sm="6">
            <VAutocomplete v-model="idclub" :items="clubs" 
              item-title="merged" item-value="idclub" color="purple"
              label="Club" clearable @update:model-value="selectClub" >
            </VAutocomplete>
          </VCol>
          <VCol cols="12" sm="6">
            <VSelect v-model="round" :items="ic_rounds" label="Round" 
              @update:model-value="selectRound">
            </VSelect>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <h3 class="mt-2">
      Selected club: {{ icclub.idclub }} {{ icclub.name }}
    </h3>
    <div class="elevation-2">
      <VTabs v-model="tab" color="purple" @update:modelValue="changeTab" >
        <VTab value="results">Results</VTab>        
        <VTab value="venues">Venues</VTab>
        <VTab value="playerlist">Player lists</VTab>
        <VTab value="downloads">Downloads</VTab>   
      </VTabs>
      <VWindow v-model="tab" @update:modelValue="changeTab">
        <VWindowItem value="results" :eager="true">
          <Results ref="refresults"  />
        </VWindowItem>      
        <VWindowItem value="venues" :eager="true">
          <Venue ref="refvenues" />
        </VWindowItem>
        <VWindowItem value="playerlist" :eager="true">
          <Playerlist ref="refplayerlist"
            @playerlist-updated="onPlayerlistUpdated"
          />
        </VWindowItem>
        <VWindowItem value="downloads" :eager="true">
          <Downloads ref="refdownloads"  />
        </VWindowItem>
      </VWindow>
    </div>    
  </VContainer>

</template>