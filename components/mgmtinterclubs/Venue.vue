<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { INTERCLUBS_STATUS, INTERCLUBS_ROUNDS, EMPTY_VENUE } from '@/util/interclubs'

// communication with manager
const emit = defineEmits(['displaySnackbar',  'changeDialogCounter'])
defineExpose({ setup })

// idtoken
const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore) 
const { $backend } = useNuxtApp()

// datamodel
const idclub = ref(0) 
const rounds =  Object.entries(INTERCLUBS_ROUNDS).map(x => ({
   value: x[1], title: `R${x[0]}: ${x[1]}` 
}))
const statuscm = ref(INTERCLUBS_STATUS.CONSULTING)
const status_consulting = computed(() => (statuscm.value == INTERCLUBS_STATUS.CONSULTING))
const status_modifying = computed(() => (statuscm.value == INTERCLUBS_STATUS.MODIFYING))
const venues = ref([])


// methods 
function  addEmptyVenue() {
  const last = venues.value[venues.value.length - 1]
  if (!last || last.address !== '') {
    venues.value.push({ ...EMPTY_VENUE })
  }
}

function cancelVenues() {
  statuscm.value = INTERCLUBS_STATUS.CONSULTING
}

function deleteVenue(ix) {
  venues.value.splice(ix, 1)
  addEmptyVenue()
}

async function getICVenues() {
  let reply
  if (!idclub.value) {
    venues.value = []
    return
  }
  emit('changeDialogCounter',1)
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
    emit('changeDialogCounter', -1)
  }
  venues.value = reply.data.venues
  venues.value.forEach((v) => {
    v.available = v.notavailable.length ? "selected" : "all"
    venues.value.push(v)
  })  
}

function modifyICvenues() {
  statuscm.value = INTERCLUBS_STATUS.MODIFYING
  addEmptyVenue()
}

async function saveVenues() {
  let reply
  try {
    let savedvenues = []
    venues.value.forEach(v => {
      if (v.address && v.address.length) {
        let { available, ...others } = v
        savedvenues.push(others)
      }
    })
    reply = await $backend("interclub", "mgmt_set_interclubvenues", {
      token: mgmttoken.value,
      idclub: idclub.value,
      venues: savedvenues,
    })
  } catch (error) {
    emit('displaySnackbar', error.message)
    return
  }
  statuscm.value = INTERCLUBS_STATUS.CONSULTING
  emit('displaySnackbar', 'Interclub venue saved')
}

function setup(clb){
  console.log('setup venues', clb)
  idclub.value = clb.idclub
  getICVenues()
}

</script>
<template>
  <v-container v-if="!idclub">
    No club selected.
  </v-container>
  <v-container  v-if="idclub">
    <h2>Interclub venues</h2>
    <v-container v-show="status_consulting">
        <v-row v-show="!venues.length">
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Venues
              </v-card-title>
              <v-card-text>
                No interclub venue is defined
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(v, ix) in venues" :key="ix" >
            <v-card class="elevation-5">
              <v-card-title>
                Venue: {{ ix + 1 }}
              </v-card-title>
              <v-card-text>
                <div><b>Address:</b> <br />
                  <span v-html="v.address.split('\n').join('<br />')"></span>
                </div>
                <div><b>Capacity (boards):</b> {{ v.capacity }}</div>
                <div><b>Not available:</b> {{ v.notavailable.join(', ') }}</div>
                <p>Optional</p>
                <div><b>Email address venue:</b> {{ v.email }}</div>
                <div><b>Telephone number venue:</b> {{ v.phone }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="modifyICvenues">
            Edit
          </v-btn>
        </v-row>
      </v-container>

      <v-container v-show="status_modifying">
        <v-row >
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(v, ix) in venues" :key="ix">
            <v-card class="elevation-5">
              <v-card-title>
                Venue: {{ ix + 1 }}
              </v-card-title>
              <v-card-text>
                <v-textarea v-model="v.address" label="Address" rows="3" @input="addEmptyVenue"
                  outlined />
                <v-text-field v-model="v.capacity" label="Capacity (boards)" type="number"/>
                <h4>Availability</h4>
                <v-radio-group v-model="v.available">
                  <v-radio value="all" label="All rounds" />
                  <v-radio value="selected"
                    label="The venue is not available on following rounds" />
                </v-radio-group>
                <v-select multiple v-show="v.available != 'all'" :items="rounds" chips
                  v-model="v.notavailable"
                  label="Select the rounds the venue is not available" />
                <p class="fieldname">Optionally</p>
                <v-text-field v-model="v.email" label="Email address venue" />
                <v-text-field v-model="v.phone" label="Telephone number venue" />
              </v-card-text>
              <v-card-actions>
                <v-btn fab small @click="deleteVenue(ix)" v-show="ix < venues.length - 1">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>   
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="saveVenues">
            Save Venues
          </v-btn>
          <v-btn @click="cancelVenues">
            Cancel
          </v-btn>
        </v-row>
      </v-container>    
  </v-container>
</template>
