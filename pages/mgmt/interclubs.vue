<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { usePersonStore } from "@/store/person"
import { storeToRefs } from 'pinia'

const localePath = useLocalePath()
const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore) 
const personstore = usePersonStore();
const { person } = storeToRefs(personstore)

const { $backend } = useNuxtApp()
const clubmembers = ref([])     // the members of a club as in signaletique
const clubmembers_id = ref(0)
const clubs = ref([])
const icclub = ref({})          // the icclub data
const reficclub = ref(null)     // the ref to the window tab
const icvenues = ref([])        // the venues data
const reficvenues = ref(null)   // the ref to the window tab
const idclub = ref(null)
const waitingdialog = ref(false)
let dialogcounter = 0
const tab = ref(null)
const errortext = ref(null)
const snackbar = ref(null)

definePageMeta({
  layout: 'mgmt'
})

useHead({
  script: [
    { src: 'https://accounts.google.com/gsi/client', defer: true }
  ],
  title: 'Management Clubs',    
})


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

function changeDialogCounter(i) {
    dialogcounter += i
    waitingdialog.value = (dialogcounter > 0)
}

function displaySnackbar(text, color) {
  errortext.value = text
  snackbar.value = true
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
    await getClubMembers()
    nextTick(() => {
      reficclub.value.readICclub()
    })    
  }
}

async function getClubMembers() {
  // get club members for member database currently on old site
  if (!idclub.value) return
  if (idclub.value == clubmembers_id.value) return  // it is already read in
  changeDialogCounter(1)
  let reply
  clubmembers.value = null
  try {
    reply = await $backend("member", "anon_getclubmembers", {
      idclub: idclub.value,
    })
  } catch (error) {    
    console.log('getClubMembers error')
    displaySnackbar(t(error.message))
    return
  } finally {
    changeDialogCounter(-1)
  }
  clubmembers_id.value = idclub.value
  const members = reply.data
  members.forEach(p => {
    p.merged = `${p.idnumber}: ${p.first_name} ${p.last_name}`
  })
  clubmembers.value = members.sort((a, b) =>
    (a.last_name > b.last_name ? 1 : -1))
  nextTick(() => {
    reficclub.value.readMembers()
  })   
}

async function getICVenues() {
  let reply
  if (!idclub.value) {
    icvenues.value = []
    return
  }
  changeDialogCounter(1)
  try {
    reply = await $backend("interclub","anon_getICVenues", {
        idclub: idclub.value
    })
  } catch (error) {
    console.log('NOK getICVenues')       
    displaySnackbar(t(error.message))
    return
  }
  finally {
    changeDialogCounter(-1)
  }
  icvenues.value = reply.data.venues
  nextTick(() => {
    reficvenues.value.readInterclubVenues()
  })   
}

async function selectClub(){
  await getClubDetails()
  await getICVenues()
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
        <v-card-title>'Loading...</v-card-title>
        <v-card-text>
          <v-progress-circular indeterminate color="green" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-text>
        Select the club: start typing number or name
        <VAutocomplete v-model="idclub" :items="clubs" 
          item-title="merged" item-value="idclub" color="green"
          label="Club" clearable @update:model-value="selectClub" >
        </VAutocomplete>
      </v-card-text>
    </v-card>
    <h3 class="mt-2">
      Selected club: {{ icclub.idclub }} {{ icclub.name }}
    </h3>
    <div class="elevation-2">
      <v-tabs v-model="tab" color="green">
        <v-tab>Venue</v-tab>
        <v-tab>Player list</v-tab>
        <v-tab>Downloads</v-tab>   
      </v-tabs>
      <v-window v-model="tab" >
        <v-window-item :eager="true">
          <MgmtinterclubsVenue  ref="reficvenues"
            :icclub="icclub" 
            :icvenues="icvenues" 
            @snackbar="displaySnackbar"
            @updateVenues="getICVenues" />
        </v-window-item>
        <v-window-item :eager="true">
          <MgmtinterclubsIcClub ref="reficclub" 
            :icclub="icclub" 
            :members="clubmembers"
            @displaySnackbar="displaySnackbar"
            @changeDialogCounter="changeDialogCounter"
          />
        </v-window-item>
        <v-window-item :eager="true">
          <MgmtinterclubsDownloads />
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