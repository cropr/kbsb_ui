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
                  item-value="idnumber" color="green" clearable @change="updateboard(f)">
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
          <v-btn @click="saveClub">{{ $t('Save club') }}</v-btn>
          <v-btn @click="cancelClub">{{ $t('Cancel') }}</v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>

<script>

import { boardroles, visibility_items, CLUB_STATUS, EMPTY_BOARD, EMPTY_CLUB } from '@/util/club'

export default {

  name: 'Board',

  data() {
    return {
      boardmembers: EMPTY_BOARD,
      boardroles: boardroles,
      clubdetails: EMPTY_CLUB,
      copyclubdetails: null,
      mbr_items: [],
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
    logintoken() { return this.$store.state.oldlogin.value },
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
        const reply = await this.$api.club.clb_get_club({
          idclub: this.club.idclub,
          token: this.logintoken
        })
        this.readClubdetails(reply.data)
      } catch (error) {
        switch (reply.status) {
          case 401:
            this.gotoLogin()
            break
          case 403:
            this.$root.$emit('snackbar', { text: this.$t('Permission denied') })
            break
          default:
            console.error('Getting clubs failed', reply.data.detail)
            this.$root.$emit('snackbar', { text: this.$t('Getting club details failed') })
        }
      }
    },

    gotoLogin() {
      this.$router.push('/mgmt/login?url=__clubs__manager')
    },

    async modifyClub() {
      try {
        const reply = await this.$api.club.verify_club_access({
          idclub: this.club.idclub,
          role: "ClubAdmin",
          token: this.logintoken,
        })
        this.status = CLUB_STATUS.MODIFYING
      } catch (error) {
        const reply = error.response
        switch (reply.status) {
          case 401:
            this.gotoLogin()
            break
          default:
            console.error('Getting clubs failed', reply.data.detail)
            this.$root.$emit('snackbar', { text: this.$t('Permission denied') })
        }
      }
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
        const reply = await this.$api.club.clb_update_club({
          ...update,
          idclub: this.clubdetails.idclub,
          token: this.logintoken,
        })
        this.status = CLUB_STATUS.CONSULTING
        this.$root.$emit('snackbar', { text: this.$t('Club saved') })
      } catch (error) {
        const reply = error.response
        switch (reply.status) {
          case 401:
            this.gotoLogin()
            break
          case 403:
            this.$root.$emit('snackbar', { text: this.$t('Permission denied') })
            break
          default:
            console.error('Getting clubs failed', reply.data.detail)
            this.$root.$emit('snackbar', { text: this.$t('Saving club details') })
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
        if (!bm.first_name) bm.first_name = cm.first_name
        if (!bm.last_name) bm.last_name = cm.last_name
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
  color: green;
}
.v-card__text, .v-card__title {
  word-break: normal; /* maybe !important  */
}
</style>
