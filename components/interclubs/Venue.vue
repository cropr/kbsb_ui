<script setup>
import {ref, computed, nextTick} from 'vue'
import { EMPTY_CLUB } from '@/util/club'
import { INTERCLUBS_STATUS, INTERCLUBS_ROUNDS, EMPTY_VENUE } from '@/util/interclubs.js'
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'

const { localePath } = useLocalePath()
const { locale, t } = useI18n()
const { $backend } = useNuxtApp()
const props = defineProps(["club","icvenues"])
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)
const rounds =  Object.entries(INTERCLUBS_ROUNDS).map(x => ({
   value: x[1], title: `R${x[0]}: ${x[1]}` 
}))
const statuscm = ref(INTERCLUBS_STATUS.CONSULTING)
const status_consulting = computed(() => (statuscm.value == INTERCLUBS_STATUS.CONSULTING))
const status_modifying = computed(() => (statuscm.value == INTERCLUBS_STATUS.MODIFYING))
const venues = ref(props.icvenues)
const emit = defineEmits(['displaySnackbar', 'updateVenues'])

function  addEmptyVenue() {
  console.log('addEmpty Venue')
  const last = venues.value[venues.value.length - 1]
  if (!last || last.address !== '') {
    venues.value.push({ ...EMPTY_VENUE })
  }
}

function cancelVenues() {
  statuscm.value = INTERCLUBS_STATUS.CONSULTING
  emit('updateVenues')
}

function deleteVenue(ix) {
  venues.value,splice(ix, 1)
  addEmptyVenue()
}

function modifyVenues() {
  statuscm.value = INTERCLUBS_STATUS.MODIFYING
  addEmptyVenue()
}

function readInterclubVenues() {
  venues.value = []
  props.icvenues.forEach((v) => {
    v.available = v.notavailable.length ? "selected" : "all"
    venues.value.push(v)
  })
}

async function saveVenues() {
  let reply
  try {
    console.log('Saving venues')
    let savedvenues = []
    venues.value.forEach(v => {
      if (v.address && v.address.length) {
        let { available, ...others } = v
        savedvenues.push(others)
      }
    })
    reply = await $backend("interclub", "set_interclubvenues", {
      token: idtoken.value,
      idclub: props.club.idclub,
      venues: savedvenues,
    })
  } catch (error) {
    if (error.code == 401) gotoLogin()
    emit('displaySnackbar', t(error.message))
    return
  }
  statuscm.value = INTERCLUBS_STATUS.CONSULTING
  emit('displaySnackbar', t('Interclub venue saved'))
  emit('updateVenues')
}

defineExpose({readInterclubVenues})
</script>
<template>
  <v-container>
    <h2>{{ $t('Interclub venues') }}</h2>
    <p v-if="!club.idclub">{{ $t('Please select a club to view the interclub venues') }}</p>
    <div v-if="club.idclub">

      <v-container v-show="status_consulting">
        <v-row v-show="!venues.length">
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                {{  $t('Venues') }}
              </v-card-title>
              <v-card-text>
                {{ $t('No interclub venue is defined yet') }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(v, ix) in venues" :key="ix" >
            <v-card class="elevation-5">
              <v-card-title>
                {{ $t('Venue') }}: {{ ix + 1 }}
              </v-card-title>
              <v-card-text>
                <div><b>{{ $t('Address') }}:</b> <br />
                  <span v-html="v.address.split('\n').join('<br />')"></span>
                </div>
                <div><b>{{ $t('Capacity (boards)') }}:</b> {{ v.capacity }}</div>
                <div><b>{{ $t('Not available') }}:</b> {{ v.notavailable.join(', ') }}</div>
                <p>{{ $t('Optional') }}</p>
                <div><b>{{ $t('Email address venue') }}:</b> {{ v.email }}</div>
                <div><b>{{ $t('Telephone number venue') }}:</b> {{ v.phone }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="modifyVenues">
            {{ $t('Edit') }}
          </v-btn>
        </v-row>
      </v-container>

      <v-container v-show="status_modifying">
        <v-row >
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(v, ix) in venues" :key="ix">
            <v-card class="elevation-5">
              <v-card-title>
                {{ $t('Venue') }}: {{ ix + 1 }}
              </v-card-title>
              <v-card-text>
                <v-textarea v-model="v.address" :label="$t('Address')" rows="3" @input="addEmptyVenue"
                  outlined />
                <v-text-field v-model="v.capacity" :label="$t('Capacity (boards)')" type="number"/>
                <h4>{{ $t('Availability') }}</h4>
                <v-radio-group v-model="v.available">
                  <v-radio value="all" :label="$t('All rounds')" />
                  <v-radio value="selected"
                    :label="$t('The venue is not available on following rounds')" />
                </v-radio-group>
                <v-select multiple v-show="v.available != 'all'" :items="rounds" chips
                  v-model="v.notavailable"
                  :label="$t('Select the rounds the venue is not available')" />
                <p class="fieldname">{{ $t('Optionally') }}</p>
                <v-text-field v-model="v.email" :label="$t('Email address venue')" />
                <v-text-field v-model="v.phone" :label="$t('Telephone number venue')" />
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
            {{ $t('Save Venues') }}
          </v-btn>
          <v-btn @click="cancelVenues">
            {{ $t('Cancel') }}
          </v-btn>
        </v-row>
      </v-container>

    </div>
  </v-container>
</template>
