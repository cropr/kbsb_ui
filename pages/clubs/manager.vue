<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { EMPTY_CLUB } from '@/util/club'
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'

const { locale } = useI18n()
const localePath = useLocalePath()
const { $backend } = useNuxtApp()
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)


const clubmembers = ref(null)
const activeclub = ref({})
const clubs = ref([])
const idclub = ref(null)
const waitingdialog = ref(false)
const board = ref(null)
const detail = ref(null)
const access = ref(null)

function checkAuth() {
  if (!idtoken.value) {
    gotoLogin()
  }
}

async function getClubs() {
  console.log('getting clubs')
  waitingdialog.value = true
  try {
    const reply = await $backend("club","anon_get_clubs", {})
    waitingdialog.value = false
    console.log('getting club OK', reply)        
    clubs.value = reply.data.clubs
    clubs.value.forEach(p => {
      p.merged = `${p.idclub}: ${p.name_short} ${p.name_long}`
    })
  } catch (error) {
    waitingdialog.value = false
    const reply = error.response
    console.error('Getting clubs failed', reply)
    // this.$root.$emit('snackbar', {
    //   text: 'Getting clubs failed'
    // })
  }
}

async function getClubMembers() {
  waitingdialog.value = true
  clubmembers.value = null
  console.log("get_clubmembers", idclub.value )
  try {
    const reply = await $backend("old", "get_members", {
      idclub: idclub.value,
    })
    waitingdialog.value = false
    const members = reply.data.activemembers
    members.forEach(p => {
      p.merged = `${p.idnumber}: ${p.first_name} ${p.last_name}`
    })
    clubmembers.value = members.sort((a, b) =>
      (a.last_name > b.last_name ? 1 : -1))
  } catch (error) {
    waitingdialog.value = false        
    const reply = error.reply
    if (reply.status == 401) {
      gotoLogin()
    }
    else {
      console.error('Getting club members failed', reply)
      // this.$root.$emit('snackbar', { text: this.$t('Getting club members failed') })
    }
  }
}

async function gotoLogin() {
  await navigateTo(localePath('/tools/oldlogin?url=__clubs__manager'))
}

async function selectclub() {
  if (!idclub.value) {
    activeclub.value = {}
    return
  }
  try {
    const reply = await $backend("club", "verify_club_access", {
      idclub: idclub.value,
      role: "ClubAdmin",
      token: idtoken.value,
    })
    clubs.value.forEach((c) => {
      if (c.idclub == idclub.value) {
        activeclub.value = { ...EMPTY_CLUB, ...c }
      }
    })
    nextTick(() => {
      detail.value.setupDetails()
      board.value.setupBoard()
    })
    getClubMembers()   
  } catch (error) {
      console.error('Getting clubs failed', error)
      // this.$root.$emit('snackbar', { text: this.$t('Permission denied') })
  }
}

onMounted( ()=> {
  checkAuth()
  getClubs()
})
</script>

<template>
  <v-container>
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
        {{ $t('Select the club') }} ({{ $t('Start typing number or name') }})
        <VAutocomplete v-model="idclub" :items="clubs" 
          item-title="merged" item-value="idclub" color="green"
          label="Club" clearable @update:model-value="selectclub" >
        </VAutocomplete>
      </v-card-text>
    </v-card>
    <h3 class="mt-2">{{ $t('Selected club') }}: {{ activeclub.idclub }} {{ activeclub.name_short }}
    </h3>
    <div class="elevation-2">
      <v-tabs v-model="tab" color="green" @change="updateTab">
        <v-tab>{{ $t('Details') }}</v-tab>
        <v-tab>{{ $t('Board members') }}</v-tab>
        <v-tab>{{ $t('Access Rights') }}</v-tab>
      </v-tabs>
      <v-window v-model="tab" >
        <v-window-item :eager="true">
          <ClubDetails :club="activeclub" ref="detail" />
        </v-window-item>
        <v-window-item :eager="true">
          <ClubBoard  :club="activeclub" :clubmembers="clubmembers" ref="board"/>
        </v-window-item>
        <v-window-item :eager="true">
          <ClubAccess  :club="activeclub" :clubmembers="clubmembers" ref="access"/>
        </v-window-item>
      </v-window>
    </div>

  </v-container>
</template>