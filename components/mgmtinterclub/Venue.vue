<template>
  <v-container>
    <h2>Interclub venues</h2>
    <p v-if="!club.idclub">Please select a club to view the interclub venues</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <v-row v-show="!venues.length">
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Venues
              </v-card-title>
              <v-card-text>
                No interclub venue is defined yet
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(v, ix) in venues" :key="ix" >
            <v-card class="elevation-5">
              <v-card-title>
                Venue': {{ ix + 1 }}
              </v-card-title>
              <v-card-text>
                <div><b>Address':</b> <br />
                  <span v-html="v.address.split('\n').join('<br />')"></span>
                </div>
                <div><b>Capacity (boards):</b> {{ v.capacity }}</div>
                <div><b>Not available':</b> {{ v.notavailable.join(', ') }}</div>
                <p>Optional</p>
                <div><b>Email address venue:</b> {{ v.email }}</div>
                <div><b>Telephone number venue:</b> {{ v.phone }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="modifyVenues">
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
    club: Object
  },

  computed: {
    logintoken() { return this.$store.state.newlogin.value },
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
      this.venue.splice(ix, 1)
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
        this.$root.$emit('snackbar', { text: 'Getting interclub venues failed' })
      }
    },

    async modifyVenues() {
      this.status = INTERCLUBS_STATUS.MODIFYING
      this.addEmptyVenue()
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
        const reply = await this.$api.interclub.mgmt_set_interclubvenues({
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
              text: "You don't have the access rights to perform this action"
            })
            break
          default:
            console.error('Saving interclub venues failed', reply.data.detail)
            this.$root.$emit('snackbar', { text: 'Saving interclub venues failed'})
        }
      }
    },

    async setupVenues(){
      await this.find_interclubvenues()
    },

  },



}
</script>