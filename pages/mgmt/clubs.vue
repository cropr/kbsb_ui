<template>
  <v-container>
    <h1>Club Manager</h1>
    <v-dialog width="10em" v-model="waiting_dialog">
      <template v-slot:activator="{ on, attrs }"></template>
      <v-card>
        <v-card-title>Loading...</v-card-title>
        <v-card-text>
          <v-progress-circular indeterminate color="deep-purple" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="4">
            <v-btn @click="notyet">Create new club</v-btn><br />
            <v-btn @click="notyet" class="mt-2">Make a mailing</v-btn>
          </v-col>
          <v-col cols="8">
            <v-btn @click="download">Export list of clubs</v-btn>
            <v-select label="Format" v-model="exportformat" :items="exportformats">
            </v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <h2 class="mt-2">Managing a single club</h2>
    <v-card class="mt-2">
      <v-card-text>
        Select the club. (start typing number or name)
        <v-autocomplete v-model="idclub" :items="clubs" item-text="merged" item-value="idclub" color="deep-purple"
          label="Club" clearable @change="selectclub">
          <template v-slot:item="data">
            {{ data.item.merged }}
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>

    <h3 class="mt-2">Selected club: {{ activeclub.idclub }} {{ activeclub.name_short }}
    </h3>
    <div class="elevation-2">

      <v-tabs v-model="tab" color="deep-purple" @change="updateTab">
        <v-tabs-slider color="deep-purple"></v-tabs-slider>
        <v-tab>Details</v-tab>
        <v-tab>Board members</v-tab>
        <v-tab>Access rights</v-tab>
        <!-- <v-tab>Downloads</v-tab> -->
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item :eager="true">
          <MgmtclubDetails :bus="bus" :club="activeclub" ref="detail" />
        </v-tab-item>
        <v-tab-item :eager="true">
          <MgmtclubBoard :bus="bus" :club="activeclub" :clubmembers="clubmembers" ref="board"/>
        </v-tab-item>
        <v-tab-item :eager="true">
          <MgmtclubAccess :bus="bus" :club="activeclub" :clubmembers="clubmembers" ref="access"/>
        </v-tab-item>
        <!-- <v-tab-item>
          <MgmtclubDownloads />
        </v-tab-item> -->
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script>
import Vue from 'vue'
import { EMPTY_CLUB } from '@/util/club'
const noop = function () { }

function utoa(data) {
  return window.btoa(unescape(encodeURIComponent(data)));
}

export default {

  name: 'Club',

  layout: 'mgmt',

  data() {
    return {
      activeclub: {},
      bus: new Vue(),
      clubmembers: null,      
      clubs: [],
      exportformat: "JSON",
      exportformats: [
        "JSON",
        "CSV",
        "Excel",
      ],      
      idclub: null,
      tab: null,
      waiting_dialog: false
    }
  },

  computed: {
    logintoken() {
      return this.$store.state.newlogin.value
    },
    person() {
      return this.$store.state.person
    },
  },

  head: {
    title: 'Management Clubs',
    script: [
      {
        src: 'https://accounts.google.com/gsi/client',
        defer: true
      }
    ]
  },

  async mounted() {
    await this.checkAuth()
    await this.getClubs()
  },

  methods: {


    async checkAuth() {
      console.log('checking if auth is already set')
      if (!this.logintoken) {
        if (this.person.credential.length === 0) {
          this.$router.push('/mgmt')
        }
        if (!this.person.email.endsWith('@frbe-kbsb-ksb.be')) {
          this.$router.push('/mgmt')
        }
        // now login using the Google auth token
        await this.$api.root.login({
          logintype: 'google',
          token: this.person.credential
        }).then(
          (resp) => {
            this.$store.commit('newlogin/update', resp.data)
          },
          (error) => {
            const resp = error.response
            console.log('failed login', resp.data.detail)
            this.$router.push('/mgmt')
          }
        )
      }
    },

    async download(){
      switch(this.exportformat) {
        case "JSON":
          window.open('/api/v1/a/clubs', "_download")
          break
        case "CSV":
        window.open('/api/v1/a/csv/clubs', "_download")
          break
        case "Excel":
          this.$root.$emit('snackbar', {
            text: 'Not supported yet'
          })
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
        console.error('Getting club members failed', reply.data.detail)
        this.$root.$emit('snackbar', { text: 'Getting club members failed' })
      }
    },    

    notyet(){
      this.$root.$emit('snackbar', { text: 'Not available yet' })      
    },

    async selectclub() {
      if (!this.idclub) {
        this.activeclub = {}
        return
      }
      this.clubs.forEach((c) => {
        if (c.idclub == this.idclub) {
          this.activeclub = { ...EMPTY_CLUB, ...c }
        }
      })
      this.$nextTick(()=> this.bus.$emit("setupdetails"))   // fill data on load 
      this.clubmembers = null
      await this.getClubMembers()   
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

<style></style>
