<template>
  <v-container>
    <p v-if="!club.idclub">Select a club to view the club details</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <h2>Consulting board members</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(bm, f) in boardmembers" :key="f">
            <v-card class="elevation-5">
              <v-card-title class="fieldname">
                {{ f }}
              </v-card-title>
              <v-card-text>
                Name: {{ bm.first_name }} {{ bm.last_name }}<br />
                Email: {{ bm.email }}<br />
                Mobile: {{ bm.mobile }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="mt-2">
          <v-btn @click="modifyClub">Modify'</v-btn>
        </v-row>        
      </v-container>
      <v-container v-show="status_modifying">
        <h2>Modify board members</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3" v-for="(bm, f) in boardmembers" :key="f">
            <v-card class="elevation-5">
              <v-card-title class="fieldname">
                {{ f }}
              </v-card-title>
              <v-card-text>
                <v-autocomplete v-model="boardmembers[f].idnumber" :items="clubmembers" item-text="merged"
                  item-value="idnumber" color="deep-purple" clearable @change="updateboard(f)">
                  <template v-slot:item="data">
                    {{ data.item.merged }}
                  </template>
                </v-autocomplete>
                <v-text-field label="Email" v-model="boardmembers[f].email"></v-text-field>
                <v-select v-model="boardmembers[f].email_visibility" :items="visibility_items" color="deep-purple"
                  @change="updateboard(f)" label="Email visibility" />
                <v-text-field label="GSM" v-model="boardmembers[f].mobile"></v-text-field>
                <v-select v-model="boardmembers[f].mobile_visibility" :items="visibility_items" color="deep-purple"
                  @change="updateboard(f)" label="Mobile visibility" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>     
        <v-row class="ma-2">
          <v-btn @click="saveClub">Save club</v-btn>
          <v-btn @click="cancelClub">Cancel</v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>

<script>

import { BOARDROLES, visibility_items, CLUB_STATUS, EMPTY_BOARD, EMPTY_CLUB } from '@/util/club'

export default {

  name: 'Details',

  data() {
    return {
      boardmembers: EMPTY_BOARD,
      boardroles: BOARDROLES,
      clubdetails: EMPTY_CLUB,
      copyclubdetails: null,
      status: CLUB_STATUS.CONSULTING,
      visibility_items: [...visibility_items],
    }
  },

  props: {
    club: Object,
    clubmembers: Array,
    bus: Object,
  },

  computed: {
    logintoken() { return this.$store.state.newlogin.value },
    status_consulting() { return this.status == CLUB_STATUS.CONSULTING },
    status_modifying() { return this.status == CLUB_STATUS.MODIFYING },
  },


  methods: {

    cancelClub() {
      this.status = CLUB_STATUS.CONSULTING
      this.get_clubdetails()
    },


    async get_clubdetails() {
      if (!this.club.id) {
        this.clubdetails = EMPTY_CLUB
        return
      }
      try {
        const reply = await this.$api.club.mgmt_get_club({
          idclub: this.club.idclub,
          token: this.logintoken
        })
        this.readClubdetails(reply.data)
      } catch (error) {
        switch (reply.status) {
          case 403:
            this.$root.$emit('snackbar', { text: 'Permission denied' })
            break
          default:
            console.error('Getting clubs failed', reply.data.detail)
            this.$root.$emit('snackbar', { text: 'Getting club details failed' })
        }
      }
    },

    async modifyClub() {  
      this.status = CLUB_STATUS.MODIFYING
    },

    readClubdetails(details) {
      this.clubdetails = { ...EMPTY_CLUB, ...details }
      this.copyclubdetails = JSON.parse(JSON.stringify(details))
      this.boardmembers = { ...EMPTY_BOARD, ...details.boardmembers }
    },

    async saveClub() {
      // build a a diff between clubdetails ans its cooy
      let update = {}
      for (const [key, value] of Object.entries(this.clubdetails)) {
        if (value != this.copyclubdetails[key]) {
          update[key] = value
        }
      }
      try {
        const reply = await this.$api.club.mgmt_update_club({
          ...update,
          idclub: this.clubdetails.idclub,
          token: this.logintoken,
        })
        this.status = CLUB_STATUS.CONSULTING
        this.$root.$emit('snackbar', { text: 'Club saved' })
      } catch (error) {
        const reply = error.response
        switch (reply.status) {
          case 403:
            this.$root.$emit('snackbar', { text: 'Permission denied' })
            break
          default:
            console.error('Getting clubs failed', reply.data.detail)
            this.$root.$emit('snackbar', { text: 'Saving club details' })
        }
      }
    },

    async setupBoard(){
      await this.get_clubdetails()
    },

    updateboard(f) {
      const bm = this.boardmembers[f]
      if (bm.idnumber) {
        let cm = this.clubmembers.find(x => x.idnumber == bm.idnumber)
        bm.first_name = cm.first_name
        bm.last_name = cm.last_name
        if (!bm.email) bm.email = cm.email
        if (!bm.mobile) bm.mobile = cm.mobile
        if (!bm.email_visibility) bm.email_visibility = "CLUB"
        if (!bm.mobile_visibility) bm.mobile_visibility = "CLUB"
        this.clubdetails.boardmembers[f] = bm
      }
      else {
        bm.first_name = null
        bm.last_name = null
        bm.email = null
        bm.mobile = null
        bm.email_visibility = null
        bm.mobile_visibility = null
        delete this.clubdetails.boardmembers[f]
      }

    },

  },

  mounted() {
    this.bus.$on("setupboard", this.setupBoard)
    this.setupBoard() 
  },

}
</script>

<style scoped>
.fieldname {
  color: purple;
}
.v-card__text, .v-card__title {
  word-break: normal; /* maybe !important  */
}
</style>
