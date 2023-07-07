<template>
  <v-container>
    <h1>Club Manager</h1>
    <v-dialog width="10em" v-model="waiting_dialog">
      <template v-slot:activator="{ on, attrs }"></template>
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
        <v-autocomplete v-model="idclub" :items="clubs" item-text="merged" item-value="idclub" color="green"
          :label="$t('Club')" clearable @change="selectclub">
          <template v-slot:item="data">
            {{ data.item.merged }}
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>
    <h3 class="mt-2">{{ $t('Selected club') }}: {{ activeclub.idclub }} {{ activeclub.name_short }}
    </h3>
    <div class="elevation-2">
      <v-tabs v-model="tab" color="green" @change="updateTab">
        <v-tabs-slider color="green"></v-tabs-slider>
        <v-tab>{{ $t('Details') }}</v-tab>
        <v-tab>{{ $t('Board members') }}</v-tab>
        <v-tab>{{ $t('Access Rights') }}</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab" >
        <v-tab-item :eager="true">
          <ClubDetails :bus="bus" :club="activeclub" ref="detail" />
        </v-tab-item>
        <v-tab-item :eager="true">
          <ClubBoard :bus="bus" :club="activeclub" :clubmembers="clubmembers" ref="board"/>
        </v-tab-item>
        <v-tab-item :eager="true">
          <ClubAccess :bus="bus" :club="activeclub" :clubmembers="clubmembers" ref="access"/>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script>
import Vue from 'vue'
import { EMPTY_CLUB } from '@/util/club'
const noop = function () { }
const tabsmapping = {
  0: ""
}

export default {

  name: 'Club',

  layout: 'default',

  data() {
    return {
      activeclub: {},
      bus: new Vue(),
      clubmembers: null,
      clubs: [],
      idclub: null,
      tab: null,
      waiting_dialog: false
    }
  },

  computed: {
    logintoken() { return this.$store.state.oldlogin.value },
  },

  async mounted() {
    await this.checkAuth()
    await this.getClubs()
  },

  methods: {

    async checkAuth() {
      if (!this.logintoken) {
        this.gotoLogin()
      }
    },

    async getClubs() {
      try {
        const reply = await this.$api.club.anon_get_clubs();        
        this.clubs = reply.data.clubs
        this.clubs.forEach(p => {
          p.merged = `${p.idclub}: ${p.name_short} ${p.name_long}`
        })
      } catch (error) {
        const reply = error.response
        console.error('Getting clubs failed', reply.data.detail)
        this.$root.$emit('snackbar', {
          text: 'Getting clubs failed'
        })
      }
    },

    async getClubMembers() {
      this.waiting_dialog = true
      try {
        const reply = await this.$api.old.get_clubmembers({
          idclub: this.idclub,
        })
        this.waiting_dialog = false
        const members = reply.data.activemembers
        members.forEach(p => {
          p.merged = `${p.idnumber}: ${p.first_name} ${p.last_name}`
        })
        this.clubmembers = members.sort((a, b) =>
          (a.last_name > b.last_name ? 1 : -1))
      } catch (error) {
        this.waiting_dialog = false        
        const reply = error.reply
        if (reply.status == 401) {
          this.gotoLogin()
        }
        else {
          console.error('Getting club members failed', reply.data.detail)
          this.$root.$emit('snackbar', { text: this.$t('Getting club members failed') })
        }
      }
    },

    gotoLogin() {
      this.$router.push('/tools/oldlogin?url=__clubs__manager')
    },

    async selectclub() {
      if (!this.idclub) {
        this.activeclub = {}
        return
      }
      try {
        const reply = await this.$api.club.verify_club_access({
          idclub: this.idclub,
          role: "ClubAdmin",
          token: this.logintoken,
        })
        this.clubs.forEach((c) => {
          if (c.idclub == this.idclub) {
            this.activeclub = { ...EMPTY_CLUB, ...c }
          }
        })
        this.$nextTick(()=> this.bus.$emit("setupdetails"))   // fill data on load 
        this.clubmembers = null
        await this.getClubMembers()   
      } catch (error) {
          console.error('Getting clubs failed', error)
          this.$root.$emit('snackbar', { text: this.$t('Permission denied') })
      }
    },

    updateTab(){
      switch (this.tab) {
        case 0:
          this.bus.$emit("setupdetails")
          break
        case 1:
          console.log('emitting board')
          this.bus.$emit("setupboard")
          break
        case 2:
          console.log('emitting access')
          this.bus.$emit("setupaccess")
          break
      }
    }
  }

}
</script>

<style></style>``
