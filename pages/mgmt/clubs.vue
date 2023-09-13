<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { EMPTY_CLUB } from '@/util/club'
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { usePersonStore } from "@/store/person"
import { storeToRefs } from 'pinia'

const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore) 
const personstore = usePersonStore();
const { person } = storeToRefs(personstore)
const localePath = useLocalePath()
const { $backend } = useNuxtApp()
const clubmembers = ref(null)
const clubmembers_id = ref(0)
const club = ref(EMPTY_CLUB) 
const clubs = ref([])
const idclub = ref(null)

const board = ref(null)
const detail = ref(null)
const access = ref(null)
const tab = ref(null)

//downloads
const exportformat = ref("JSON")
const exportformats =  [
  "JSON",
  "CSV",
  "Excel",
]

// snackbar
const errortext = ref(null)
const snackbar = ref(null)

// waitingdialog
const waitingdialog = ref(false)
let dialogcounter = 0

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
  console.log('checking if auth is already set', mgmttoken.value)
  if (mgmttoken.value) return 
  if (person.value.credentials.length === 0) {
    console.log('credentials not valid')
    navigateTo('/mgmt')
    return
  }
  if (!person.value.email.endsWith('@frbe-kbsb-ksb.be')) {
    console.log('email not valid')
    // navigateTo('/mgmt')
    return
  }
  let reply
  changeDialogCounter(1)
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
    console.log('login not valid')
    // navigateTo('/mgmt')
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

async function download(){
  // switch(this.exportformat) {
  //   case "JSON":
  //     window.open('/api/v1/a/clubs', "_download")
  //     break
  //   case "CSV":
  //   window.open('/api/v1/a/csv/clubs', "_download")
  //     break
  //   case "Excel":
  //     this.$root.$emit('snackbar', {
  //       text: 'Not supported yet'
  //     })
  // }
}

async function getClubs() {
  let reply
  changeDialogCounter(1)
  try {
    reply = await $backend("club", "anon_get_clubs", {})
  } catch (error) {
    console.log('getClubs error')
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
  club.value = EMPTY_CLUB
  if (idclub.value) {
    changeDialogCounter(1)
    try {
      reply = await $backend("club","mgmt_get_club" ,{
        idclub: idclub.value,
        token: mgmttoken.value
      })
    } catch (error) {
      conmsole.log('getClubDetails error')
      displaySnackbar(error.message)
      return
    } finally {
      changeDialogCounter(-1)
    }
    club.value = reply.data    
  }
  nextTick(() => {
    detail.value.readClubDetails()
    board.value.readClubDetails()
    access.value.readClubDetails()
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
    board.value.readClubMembers()
    access.value.readClubMembers()  
  })  
}

async function gotoLogin() {
  await navigateTo(localePath('/tools/oldlogin?url=__clubs__manager'))
}

async function selectClub(){
  await getClubDetails()
  await getClubMembers()
}

onMounted( () => {
  checkAuth()
  getClubs()
})
</script>

<template>
  <VContainer>
    <h1>Club Manager</h1>
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
        <v-row>
          <!-- <v-col cols="4">
            <v-btn @click="notyet">Create new club</v-btn><br />
            <v-btn @click="notyet" class="mt-2">Make a mailing</v-btn>
          </v-col> -->
          <v-col cols="8">
            <v-btn @click="download">Export list of clubs</v-btn>
            <v-select label="Format" v-model="exportformat" :items="exportformats">
            </v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
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
        <v-tab>{{ $t('Details') }}</v-tab>
        <v-tab>{{ $t('Board members') }}</v-tab>
        <v-tab>{{ $t('Access Rights') }}</v-tab>
      </v-tabs>
      <v-window v-model="tab" >
        <v-window-item :eager="true">
          <MgmtclubDetails :club="club" ref="detail" @snackbar="displaySnackbar" 
            @updateClub="getClubDetails" />
        </v-window-item>
        <v-window-item :eager="true">
          <MgmtclubBoard  :club="club" :clubmembers="clubmembers" ref="board" @snackbar="displaySnackbar"
            @updateClub="getClubDetails" />
        </v-window-item>
        <v-window-item :eager="true">
          <MgmtclubAccess  :club="club" :clubmembers="clubmembers" ref="access" @snackbar="displaySnackbar"
            @updateClub="getClubDetails" />
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