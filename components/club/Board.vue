<script setup>
import { ref, computed, nextTick } from 'vue'
import { BOARDROLES, visibility_items, CLUB_STATUS, EMPTY_BOARD, EMPTY_CLUB } from '@/util/club'
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'
import showdown from 'showdown'

const { localePath } = useLocalePath()
const { locale } = useI18n()
const { $backend } = useNuxtApp()
const props = defineProps(['club', 'clubmembers'])
const boardmembers = ref(EMPTY_BOARD)
const boardroles =  ref(BOARDROLES)
const clubdetails = ref(EMPTY_CLUB)
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)
const statusc = ref(CLUB_STATUS.CONSULTING)
const status_consulting = computed(() => (statusc.value == CLUB_STATUS.CONSULTING))
const status_modifying = computed(() => (statusc.value == CLUB_STATUS.MODIFYING))
let copyclubdetails = null

function cancelClub() {
  statusc.value = CLUB_STATUS.CONSULTING
  get_clubdetails()
}

async function get_clubdetails() {
  // if (!props.club.idclub) {
  //   clubdetails.value = EMPTY_CLUB
  //   return
  // }
  // try {
  //   const reply = await $backend("club","clb_get_club" ,{
  //     idclub: props.club.idclub,
  //     token: idtoken.value
  //   })
  //   readClubdetails(reply.data)
  // } catch (error) {
  //   switch (reply.status) {
  //     case 401:
  //       gotoLogin()
  //       break
  //     case 403:
  //       // this.$root.$emit('snackbar', { text: this.$t('Permission denied') })
  //       break
  //     default:
  //       console.error('Getting clubs failed', reply.data.detail)
  //       // this.$root.$emit('snackbar', { text: this.$t('Getting club details failed') })
  //   }
  // }
}

function gotoLogin() {
  navigateTo(localePath('/tools/login?url=__clubs__manager'))
}

async function modifyClub() {
  try {
    const reply = await $backend("club", "verify_club_access", {
      idclub: props.club.idclub,
      role: "ClubAdmin",
      token: idtoken.value,
    })
    statusc.value = CLUB_STATUS.MODIFYING
  } catch (error) {
    const reply = error.response
    switch (reply.status) {
      case 401:
        gotoLogin()
        break
      default:
        console.error('Getting clubs failed', reply.data.detail)
        // this.$root.$emit('snackbar', { text: this.$t('Permission denied') })
    }
  }
}

function readClubdetails(details) {
  clubdetails.value = { ...EMPTY_CLUB, ...details }
  copyclubdetails = JSON.parse(JSON.stringify(details))
  boardmembers.value = { ...EMPTY_BOARD, ...details.boardmembers }
}

async function saveClub() {
  // build a a diff between clubdetails ans its cooy
  let update = {}
  for (const [key, value] of Object.entries(clubdetails.value)) {
    if (value != copyclubdetails[key]) {
      update[key] = value
    }
  }
  try {
    const reply = await $backend("club", "clb_update_club",{
      ...update,
      idclub: props.club.idclub,
      token: idtoken.value,
    })
    statusc.value = CLUB_STATUS.CONSULTING
    // this.$root.$emit('snackbar', { text: this.$t('Club saved') })
  } catch (error) {
    const reply = error.response
    switch (reply.status) {
      case 401:
        gotoLogin()
        break
      case 403:
        // this.$root.$emit('snackbar', { text: this.$t('Permission denied') })
        break
      default:
        console.error('Getting clubs failed', reply.data.detail)
        // this.$root.$emit('snackbar', { text: this.$t('Saving club details') })
    }
  }
}

function setupBoard(){
  get_clubdetails()
}

function updateboard(f) {
  const bm = boardmembers.value[f]
  if (bm.idnumber) {
    let cm = clubmembers.value.find(x => x.idnumber == bm.idnumber)
    if (!bm.first_name) bm.first_name = cm.first_name
    if (!bm.last_name) bm.last_name = cm.last_name
    if (!bm.email) bm.email = cm.email
    if (!bm.mobile) bm.mobile = cm.mobile
    if (!bm.email_visibility) bm.email_visibility = "CLUB"
    if (!bm.mobile_visibility) bm.mobile_visibility = "CLUB"
    clubdetails.value.boardmembers[f] = bm
  }
  else {
    bm.first_name = null
    bm.last_name = null
    bm.email = null
    bm.mobile = null
    bm.email_visibility = null
    bm.mobile_visibility = null
    delete clubdetails.value.boardmembers[f]
  }

}

defineExpose({setupBoard})

</script>


<template>
  <v-container>
    <p v-if="!club.idclub">{{ $t('Select a club to view the club details') }}</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <h2>{{ $t('Consulting board members') }}</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(bm, f) in boardmembers" :key="f">
            <v-card class="elevation-5">
              <v-card-title>
                <tr-fieldname :fieldname="f" />
              </v-card-title>
              <v-card-text>
                {{ $t('Name') }}: {{ bm.first_name }} {{ bm.last_name }}<br />
                {{ $t('Email') }}: {{ bm.email }}<br />
                {{ $t('Mobile') }}: {{ bm.mobile }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="mt-2">
          <v-btn @click="modifyClub">{{ $t('Modify') }}</v-btn>
        </v-row>        
      </v-container>
      <v-container v-show="status_modifying">
        <h2>{{ $t('Modify board members') }}</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(bm, f) in boardmembers" :key="f">
            <v-card class="elevation-5">
              <v-card-title>
                <tr-fieldname :fieldname="f" />
              </v-card-title>
              <v-card-text>
                <v-autocomplete v-model="boardmembers[f].idnumber" :items="clubmembers" item-text="merged"
                  item-value="idnumber" color="green" clearable  @update:model-value="updateboard(f)">
                </v-autocomplete>
                <v-text-field label="Email" v-model="boardmembers[f].email"></v-text-field>
                <v-select v-model="boardmembers[f].email_visibility" :items="visibility_items" color="green"
                  @change="updateboard(f)" label="Email visibility" />
                <v-text-field label="GSM" v-model="boardmembers[f].mobile"></v-text-field>
                <v-select v-model="boardmembers[f].mobile_visibility" :items="visibility_items" color="green"
                  @change="updateboard(f)" label="Mobile visibility" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>     
        <v-row class="ma-2">
          <v-btn @click="saveClub">{{ $t('Save club') }}</v-btn>
          <v-btn @click="cancelClub">{{ $t('Cancel') }}</v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>

<style scoped>
.fieldname {
  color: green;
}
.v-card__text, .v-card__title {
  word-break: normal; /* maybe !important  */
}
</style>
