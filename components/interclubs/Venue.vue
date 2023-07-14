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
<script>
import { INTERCLUBS_STATUS, INTERCLUBS_ROUNDS, empty_venue } from '@/util/interclubs.js'

export default {

  name: 'Venue',

  data() {
    return {
      status: INTERCLUBS_STATUS.CONSULTING,
      rounds: Object.entries(INTERCLUBS_ROUNDS).map(x => ({ value: x[1], text: `R${x[0]}: ${x[1]}` })),
      venues: [],
    }
  },

  props: {
    bus: Object,
    club: Object,
  },

  computed: {
    logintoken() { return this.$store.state.oldlogin.value },
    status_consulting() { return this.status == INTERCLUBS_STATUS.CONSULTING },
    status_modifying() { return this.status == INTERCLUBS_STATUS.MODIFYING },
  },

  methods: {

    addEmptyVenue() {
      console.log('addEmpty Venue')
      const last = this.venues[this.venues.length - 1]
      if (!last || last.address !== '') {
        this.venues.push({ ...empty_venue })
      }
    },

    cancelVenues() {
      this.status = INTERCLUBS_STATUS.CONSULTING
      this.find_interclubvenues()
    },

    deleteVenue(ix) {
      this.venues.splice(ix, 1)
      this.addEmptyVenue()
    },


    async find_interclubvenues() {
      console.log('running find_interclubvenues', this.club)
      if (!this.club.id) {
        this.venues = []
        return
      }
      try {
        const reply = await this.$api.interclub.find_interclubvenues({
          idclub: this.club.idclub
        })
        console.log('get venues', reply.data)
        this.readVenues(reply.data ? reply.data.venues : [])
      } catch (error) {
        const reply = error.response
        console.error('Getting interclub venues failed', reply.data.detail)
        this.$root.$emit('snackbar', { text: this.$t('Getting interclub venues failed') })
      }
    },

    async modifyVenues() {
      try {
        const reply = await this.$api.club.verify_club_access({
          token: this.logintoken,
          idclub: this.club.idclub,
          role: "InterclubAdmin"
        })
        this.status = INTERCLUBS_STATUS.MODIFYING
        this.addEmptyVenue()
      } catch (error) {
        console.log('error', error)
        const reply = error.response
        switch (reply.status) {
          case 401:
            this.gotoLogin()
            break;
          case 403:
            this.$root.$emit('snackbar', { text: this.$t("Permission denied") })
            break;
          default:
            console.error('Getting accessrules club failed', reply.data.detail)
            this.$root.$emit('snackbar', { text: this.$t('Getting accessrules club failed') })
        }
      }
    },

    readVenues(venues) {
      this.venues = []
      venues.forEach((v) => {
        v.available = v.notavailable.length ? "selected" : "all"
        this.venues.push(v)
      })
    },

    async saveVenues() {
      try {
        console.log('Saving venues')
        let savedvenues = []
        this.venues.forEach(v => {
          if (v.address && v.address.length) {
            let { available, ...others } = v
            savedvenues.push(others)
          }
        })
        console.log('savedvenues', savedvenues)
        const reply = await this.$api.interclub.set_interclubvenues({
          token: this.logintoken,
          idclub: this.club.idclub,
          venues: savedvenues,
        })
        this.status = INTERCLUBS_STATUS.CONSULTING
        this.find_interclubvenues()
      } catch (error) {
        const reply = error.response
        switch (reply.status) {
          case 401:
            this.gotoLogin()
            break
          case 403:
            this.$root.$emit('snackbar', {
              text: this.$t("You don't have the access rights to perform this action")
            })
            break
          default:
            console.error('Saving interclub venues failed', reply.data.detail)
            this.$root.$emit('snackbar', { text: this.$t('Saving interclub venues failed') })
        }
      }
    },

    async setupVenues(){
      await this.find_interclubvenues()
    },

  }

}
</script>