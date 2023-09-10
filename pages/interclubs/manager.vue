<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const { $backend } = useNuxtApp()
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)


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

function checkAuth() {
  console.log('checkauth idtoken', idtoken.value)
  if (!idtoken.value) {
    gotoLogin()
  }
}

function changeDialogCounter(i) {
    dialogcounter += i
    waitingdialog.value = (dialogcounter > 0)
}

async function getClubs() {
  let reply
  changeDialogCounter(1)
  try {
    reply = await $backend("club","anon_get_clubs", {})
  } catch (error) {
    if (error.code == 401) gotoLogin()
    displaySnackbar(t(error.message))
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
      reply = await $backend("club", "verify_club_access", {
        idclub: idclub.value,
        role: "InterclubAdmin",
        token: idtoken.value,
      })
    } catch (error) {
      console.log('NO Access', error)  
      if (error.code == 401) gotoLogin()
      displaySnackbar(t(error.message))
      return
    } finally {
      changeDialogCounter(-1)
    }
    changeDialogCounter(1)
    try {
      reply = await $backend("interclub","clb_getICclub" ,{
        idclub: idclub.value,
        token: idtoken.value
      })
    } catch (error) {
      console.log('NOK getClubDetails')  
      if (error.code == 401) gotoLogin()
      displaySnackbar(t(t(error.message)))
      return
    } finally {
      changeDialogCounter(-1)
    }
    icclub.value = reply.data    
  }
  nextTick(() => {
    reficclub.value.readICclub()
  })
}

async function getClubMembers() {
  let reply
  if (!idclub.value) return
  if (idclub.value == clubmembers_id.value) return  // it is already read in
  clubmembers.value = {}
  try {
    changeDialogCounter(1)
    reply = await $backend("member", "anon_getclubmembers", {
      idclub: idclub.value,
    })
  } catch (error) { 
    console.log('NOK hetClubMembers')   
    if (error.code == 401) gotoLogin()
    displaySnackbar(t(error.message))
    return
  } finally {
    changeDialogCounter(-1)
  }
  const members = reply.data
  console.log('members', members)
  clubmembers_id.value = idclub.value
  members.forEach((p) => {
    p.fullname = `${p.last_name}, ${p.first_name}`
  })
  clubmembers.value = members
  nextTick(() => {
    reficclub.value.readMembers()
  })  
}

async function getICVenues() {
  console.log('running anon_getICVenues', icclub.value)
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
    if (error.code == 401) gotoLogin()
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

async function gotoLogin() {
  await navigateTo(localePath('/tools/oldlogin?url=__interclubs__manager'))
}

function displaySnackbar(text, color) {
  errortext.value = text
  snackbar.value = true
}

async function selectClub(){
  await getClubDetails()
  await getClubMembers()
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
      {{ $t('Selected club') }}: {{ icclub.idclub }} {{ icclub.name }}
    </h3>
    <div class="elevation-2">
      <v-tabs v-model="tab" color="green">
        <v-tab>{{ $t('Venue') }}</v-tab>
        <v-tab>{{ $t('Player list') }}</v-tab>        
      </v-tabs>
      <v-window v-model="tab" >
        <v-window-item :eager="true">
          <InterclubsVenue  ref="reficvenues"
            :icclub="icclub" 
            :icvenues="icvenues" 
            @snackbar="displaySnackbar"
            @updateVenues="getICVenues" />
        </v-window-item>
        <v-window-item :eager="true">
          <InterclubsIcClub ref="reficclub" 
            :icclub="icclub" 
            :members="clubmembers"
            @snackbar="displaySnackbar"
            @updateVenues="getICVenues"
            @changeDialogCounter="changeDialogCounter"
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