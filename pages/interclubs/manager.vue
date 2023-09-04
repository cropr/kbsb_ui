<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { EMPTY_CLUB } from '@/util/club'
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const { $backend } = useNuxtApp()
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)


const clubmembers = ref(null)
const clubmembers_id = ref(0)
const club = ref(EMPTY_CLUB) 
const clubs = ref([])
const icclub = ref(null)
const icvenues = ref([])  // the venues data per club
const venues = ref(null)  // the ref to the window tab
const idclub = ref(null)
const waitingdialog = ref(false)
let dialogcounter = 0
const tab = ref(null)
const errortext = ref(null)
const snackbar = ref(null)

function checkAuth() {
  if (!idtoken.value) {
    gotoLogin()
  }
}

function changeDialogCounter(i) {
    dialogcounter += i
    waitingdialog.value = (dialogcounter > 0)
}

async function getClubs() {
  changeDialogCounter(1)
  try {
    const reply = await $backend("club","anon_get_clubs", {})
    clubs.value = reply.data.clubs
    clubs.value.forEach(p => {
      p.merged = `${p.idclub}: ${p.name_short} ${p.name_long}`
    })
  } catch (error) {
    if (error.code == 401) gotoLogin()
    displaySnackbar(t(error.message))
    return
  }
  finally {
    changeDialogCounter(-1)
  }
}

async function getClubDetails() {
  let reply
  club.value = EMPTY_CLUB
  if (idclub.value) {
    changeDialogCounter(1)
    try {
      reply = await $backend("club", "verify_club_access", {
        idclub: idclub.value,
        role: "InterclubAdmin",
        token: idtoken.value,
      })
    } catch (error) {
      if (error.code == 401) gotoLogin()
      displaySnackbar(t(error.message))
      return
    } finally {
      changeDialogCounter(-1)
    }
    changeDialogCounter(1)
    try {
      reply = await $backend("club","clb_get_club" ,{
        idclub: idclub.value,
        token: idtoken.value
      })
    } catch (error) {
      if (error.code == 401) gotoLogin()
      displaySnackbar(t(t(error.message)))
      return
    } finally {
      changeDialogCounter(-1)
    }
    club.value = reply.data    
  }
  nextTick(() => {

  })
}

async function getClubMembers() {
  // get club members for member database currently on old site
  if (!idclub.value) return
  if (idclub.value == clubmembers_id.value) return  // it is already read in
  changeDialogCounter(1)
  let reply
  clubmembers.value = null
  try {
    reply = await $backend("old", "get_members", {
      idclub: idclub.value,
    })
  } catch (error) {    
    if (error.code == 401) gotoLogin()
    displaySnackbar(t(error.message))
    return
  } finally {
    changeDialogCounter(-1)
  }
  clubmembers_id.value = idclub.value
  const members = reply.data.activemembers
  members.forEach(p => {
    p.merged = `${p.idnumber}: ${p.first_name} ${p.last_name}`
  })
  clubmembers.value = members.sort((a, b) =>
    (a.last_name > b.last_name ? 1 : -1))
  nextTick(() => {

  })  
}

async function getInterclubVenues() {
  console.log('running find_interclubvenues', icclub.value)
  let reply
  if (!idclub.value) {
    icvenues.value = []
    return
  }
  changeDialogCounter(1)
  try {
    reply = await $backend("interclub","find_interclubvenues", {
        idclub: idclub.value
    })
  } catch (error) {
    if (error.code == 401) gotoLogin()
    displaySnackbar(t(error.message))
    return
  }
  finally {
    changeDialogCounter(-1)
  }
  icvenues.value = reply.data.venues
  nextTick(() => {
    venues.value.readInterclubVenues()
  })   
}

async function gotoLogin() {
  await navigateTo(localePath('/tools/oldlogin?url=__interclubs__manager'))
}

function displaySnackbar(text, color) {
  errortext.value = text
  snackbar.value = true
}

function selectClub(){
  getClubDetails()
  getClubMembers()
  getInterclubVenues()
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
        <v-card-title>{{ $t('Loading...')}}</v-card-title>
        <v-card-text>
          <v-progress-circular indeterminate color="green" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-text>
        {{ $t('Select the club') }} ({{ $t('Start typing number or name') }})
        <VAutocomplete v-model="idclub" :items="clubs" 
          item-title="merged" item-value="idclub" color="green"
          label="Club" clearable @update:model-value="selectClub" >
        </VAutocomplete>
      </v-card-text>
    </v-card>
    <h3 class="mt-2">
      {{ $t('Selected club') }}: {{ club.idclub }} {{ club.name_short }}
    </h3>
    <div class="elevation-2">
      <v-tabs v-model="tab" color="green">
        <v-tab>{{ $t('Venue') }}</v-tab>
      </v-tabs>
      <v-window v-model="tab" >
        <v-window-item :eager="true">
          <InterclubsVenue :club="club" :icvenues="icvenues" ref="venues" @snackbar="displaySnackbar"
            @updateVenues="getInterclubVenues"/>
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