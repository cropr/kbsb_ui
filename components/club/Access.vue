<script setup>
import {ref, computed, nextTick} from 'vue'
import { visibility_items, CLUB_STATUS, ROLES } from '@/util/club'
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'

const props = defineProps(["club", "clubmembers"])
const { $backend } = useNuxtApp()
const { localePath } = useLocalePath()
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)
const clubrights = ref({})
const clubadmin = ref ({})
const clubmemberitems = ref ([])
const interclubadmin = ref ({})
const interclubcaptain = ref({})
const newclubadmin = ref (null)
const newinterclubadmin = ref (null)
const newinterclubcaptain= ref( null)
const roles = ref( ROLES)
const statusc = ref(CLUB_STATUS.CONSULTING)
const status_consulting = computed(() => (statusc.value == CLUB_STATUS.CONSULTING))
const status_modifying = computed(() => (statusc.value == CLUB_STATUS.MODIFYING))
const t_vis_items = computed(()=>  visibility_items.map((x) =>({
  title: t(x.title),
  value: x.value
})))

function addClubAdmin() {
  const cm = props.clubmembers.find(m => m.idnumber == newclubadmin.value)
  clubadmin.value[newclubadmin.value] = cm.merged
  nextTick(() => newclubadmin.value = null);
}

function addInterclubAdmin() {
  interclubadmin.value[newinterclubadmin.value] = props.clubmembers.find(
    m => m.idnumber == newinterclubadmin.value).merged
  nextTick(() => newinterclubadmin.value = null);
}

function addInterclubCaptain() {
  interclubcaptain.value[newinterclubcaptain.value] = props.clubmembers.find(
    m => m.idnumber == newinterclubcaptain.value).merged
  nextTick(() => newinterclubcaptain.value = null);
}

function cancelAccess() {
  statusc.value = CLUB_STATUS.CONSULTING
  get_clubrights()
}

function deleteClubAdmin(m) {
  // don't delete last member
  if (Object.keys(clubadmin.value).length == 1) return
  clubadmin.value.splice(m, 1)
}

function deleteInterclubAdmin(m) {
  // don't delete last member
  if (Object.keys(this.interclubadmin).length == 1) return
  interclubadmin.splice(m, 1)
}

function deleteInterclubCaptain(m) {
  interclubcaptainsplice(m, 1)
}

async function get_clubrights() {
  let reply;
  if (!props.club.idclub) {
    clubrights.value = {}
    return
  }
  try {
    reply = await $backend("club", "clb_get_club", {
      idclub: props.club.idclub,
      token: idtoken.value
    })
  } catch (error) {
    console.log('getting club rights NOK', error)
    const reply = error.reply
    if (reply && reply.status) {
      if (reply.status == 401) {
        gotoLogin()
      }
      else {
        console.error('Getting club details failed', reply.data.detail)
        // this.$root.$emit('snackbar', { text: this.$t('Getting club details failed') })
      }
    } 
  }
  readClubrights(reply.data)
}

function gotoLogin() {
  navigateTo(localePath('/tools/oldlogin?url=__club__manager'))
}

async function modifyAccess() {
  try {
    const reply = await $backend("club", "verify_club_access", {
      idclub: props.club.idclub,
      role: "ClubAdmin",
      token: idtoken.value,
    })
    statusc.value = CLUB_STATUS.MODIFYING
    clubmemberitems.value = props.clubmembers.map((x) => {
      return {
        value: x.idnumber,
        text: x.merged,
      }
    })
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

function readClubrights(details) {
  console.log('reading club rights', details, props.clubmembers)
  details.clubroles.forEach((cr) => {
    clubrights.value[cr.nature] = cr.memberlist
  })
  clubadmin.value = Object.fromEntries(clubrights.value["ClubAdmin"].map(
    (x) => {
      const cm = props.clubmembers.find(m => m.idnumber == x)
      cm.merged = `${x} ${cm.first_name} ${cm.last_name}` 
      return [x, cm.merged]
    }
  ))
  interclubadmin = Object.fromEntries(clubrights.value["InterclubAdmin"].map(
    (x) => {
      const cm = props.clubmembers.find(m => m.idnumber == x)
      cm.merged = `${x} ${cm.first_name} ${cm.last_name}` 
      return [x, cm.merged]
    }
  ))
  interclubcaptain.value = Object.fromEntries(clubrights.value["InterclubCaptain"].map(
    (x) => {
      const cm = props.clubmembers.find(m => m.idnumber == x)
      cm.merged = `${x} ${cm.first_name} ${cm.last_name}` 
      return [x, cm.merged]
    }
  ))

}

async function saveAccess() {
  try {
    const reply = await $backend("club"," clb_update_club", {
      idclub: props.club.idclub,
      clubroles: [
        {
          nature: "ClubAdmin",
          memberlist: Object.keys(clubadmin.value)
        },
        {
          nature: "InterclubAdmin",
          memberlist: Object.keys(interclubadmin.value)
        },
        {
          nature: "InterclubCaptain",
          memberlist: Object.keys(interclubcaptain.value)
        },
      ],
      token: idtoken.value,
    })
    statusc.value = CLUB_STATUS.CONSULTING
    // this.$root.$emit('snackbar', { text: 'Club saved' })
    get_clubrights()
  } catch (error) {
    const reply = error.response
    if (reply.status === 401) {
      gotoLogin()
    }
    else {
      console.error('Saving access rights failed', reply.data.detail)
      // this.$root.$emit('snackbar', { text: this.$t('Saving access rights failed') })
    }
  }
}

function setupAccess() {
  console.log('running setupAccess')
  get_clubrights()
}

defineExpose({setupAccess})
</script>


<template>
  <v-container>
    <p v-if="!club.idclub">{{ $t('Select a club to view the access rights') }}</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <h2>{{ $t('Consulting access rights') }}</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>{{ $t('Club administrators') }}</v-card-title>
              <v-card-text>
                {{ $t('The club administrators have write access to the Club Manager') }}
                <ul>
                  <li v-for="(m, ix) in clubadmin" :key="ix">{{ m }}</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>{{ $t('Interclub Administrators') }}</v-card-title>
              <v-card-text>
                {{ $t('The interclub administrators have write access to the Interclub Manager') }}
                <ul>
                  <li v-for="(m, ix) in interclubadmin" :key="ix">{{ m }}</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>
                {{ $t('Interclub Captains') }}
              </v-card-title>
              <v-card-text>
                {{ $t('The interclub captains have write access to the planning and ' +
                      'results of the Interclub.')
                }}
                <p>{{ $t('Not available yet') }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="ma-2">
          <v-btn @click="modifyAccess">{{ $t('Modify') }}</v-btn>
        </v-row>
      </v-container>
    
      <v-container  v-show="status_modifying">
        <h2 >{{ $t('Modify access rights') }}</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>{{ $t('Club administrators') }}</v-card-title>
              <v-card-text>
                <ul>
                  <li v-for="(m, ix) in clubadmin" :key="m">
                    {{ m }} &nbsp; <v-icon @click="deleteClubAdmin(ix)">mdi-delete</v-icon>
                  </li>
                </ul>
                <v-autocomplete v-model="newclubadmin" :items="clubmemberitems" @change="addClubAdmin"
                  label="Add Member" class="memberselect">
                  <template v-slot:item="data">
                    {{ data.item.text }}
                  </template>
                </v-autocomplete>              
              </v-card-text>
            </v-card>
          </v-col>        
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>{{ $t('Interclub Administrators') }}</v-card-title>
              <v-card-text>
                <ul>
                  <li v-for="(m, ix) in interclubadmin" :key="m">
                    {{ m }} &nbsp; <v-icon @click="deleteInterclubAdmin(ix)">mdi-delete</v-icon>
                  </li>
                </ul>
                <v-autocomplete v-model="newinterclubadmin" :items="clubmemberitems"
                  @change="addInterclubAdmin" label="Add Member" class="memberselect">
                  <template v-slot:item="data">
                    {{ data.item.text }}
                  </template>
                </v-autocomplete>              
              </v-card-text>
            </v-card>
          </v-col>        
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>{{ $t('Club administrators') }}</v-card-title>
              <v-card-text>{{ $t('Not available yet')}}</v-card-text>
            </v-card>
          </v-col>        
        </v-row>
        <v-row class="ma-2">
          <v-btn @click="saveAccess">{{ $t('Save') }}</v-btn>
          <v-btn @click="cancelAccess">{{ $t('Cancel') }}</v-btn>
        </v-row>
      </v-container>
    </div>

  </v-container>
</template>

<style scoped>
.memberselect {
  max-width: 20em;
}
</style>