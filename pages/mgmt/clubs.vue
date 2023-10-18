<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { VContainer, VAutocomplete, VCard,  VCardText, VTabs, VTab, VWindow, 
  VWindowItem} from 'vuetify/components'
import { Details, Access, Board }  from '@/components/mgmtclub'
import ProgressLoading from '@/components/ProgressLoading.vue'
import SnackbarMessage from '@/components/SnackbarMessage.vue'

import  { EMPTY_CLUB } from '@/util/club'
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { usePersonStore } from "@/store/person"
import { storeToRefs } from 'pinia'

const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore) 
const personstore = usePersonStore();
const { person } = storeToRefs(personstore)


//  snackbar and loading widgets
const refsnackbar = ref(null)
let showSnackbar
const refloading = ref(null)
let showLoading

const localePath = useLocalePath()
const { $backend } = useNuxtApp()
const clubmembers = ref(null)
const clubmembers_id = ref(0)
const club = ref(EMPTY_CLUB) 
const clubs = ref([])
const idclub = ref(null)


// communication with tabbed children
const tab = ref(null)
const refboard = ref(null)
const refdetails = ref(null)
const refaccess = ref(null)
function changeTab(){
  console.log('changeTab', tab.value)
  switch (tab.value) {
    // case 'board':
    //   refboard.value.setup(club.value)
    //   break
    case 'details':
      refdetails.value.setup(club.value)
      break
    // case 'access':
    //   refaccess.value.setup(club.value)
    //   break    
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


async function checkAuth() {
  console.log('checking if auth is already set', mgmttoken.value)
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
    navigateTo(localePath('/mgmt'))
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
  club.value = EMPTY_CLUB
  if (idclub.value) {
    showLoading(true)
    try {
      reply = await $backend("club","mgmt_get_club" ,{
        idclub: idclub.value,
        token: mgmttoken.value
      })
    } catch (error) {
      console.log('getClubDetails error')
      showSnackbar(error.message)
      return
    } finally {
      showLoading(false)
    }
    club.value = reply.data
    // await getClubMembers()
  }
}

async function getClubMembers() {
  // get club members for member database currently on old site
  if (!idclub.value) return
  if (idclub.value == clubmembers_id.value) return  // it is already read in
  let reply
  clubmembers.value = null
  showLoading(true)
  try {
    reply = await $backend("member", "anon_getclubmembers", {
      idclub: idclub.value,
    })
  } catch (error) {    
    console.log('getClubMembers error')
    showSnackbar(error.message)
    return
  } finally {
    showLoading(false)
  }
  clubmembers_id.value = idclub.value
  const members = reply.data
  members.forEach(p => {
    p.merged = `${p.idnumber}: ${p.first_name} ${p.last_name}`
  })
  clubmembers.value = members.sort((a, b) =>
    (a.last_name > b.last_name ? 1 : -1))
  nextTick(() => {
    // refboard.value.readClubMembers()
    // refaccess.value.readClubMembers()  
  })  
}

async function selectClub(){
  await getClubDetails()
  await getClubMembers()
}

onMounted( () => {
  showSnackbar = refsnackbar.value.showSnackbar
  showLoading = refloading.value.showLoading
  changeTab('details')
  checkAuth()
  getClubs()
})


</script>
<template>
  <VContainer>
    <SnackbarMessage ref="refsnackbar" />
    <ProgressLoading ref="refloading"/>
    <h1>Management Clubs</h1>
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
        Selected club: {{ club.idclub }} {{ club.name_short }}
      </h3>
      <div class="elevation-2">
        <v-tabs v-model="tab" color="green">
          <v-tab value="details">Details</v-tab>
          <!-- <v-tab value="baord">Board members</v-tab>
          <v-tab value="access">Access Rights</v-tab> -->
        </v-tabs>
        <v-window v-model="tab" >
          <v-window-item :eager="true">
            <Details :club="club" ref="refdetails" @updateClub="getClubDetails" />
          </v-window-item>
          <!-- <v-window-item :eager="true">
            <Board :club="club" :clubmembers="clubmembers" ref="refboard" @updateClub="getClubDetails" />
          </v-window-item>
          <v-window-item :eager="true">
            <Access :club="club" :clubmembers="clubmembers" ref="refaccess" @updateClub="getClubDetails" /> 
          </v-window-item> -->
        </v-window>
      </div>
    
  </VContainer>  
</template>