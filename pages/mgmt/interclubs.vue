<template>
  <v-container>
    <h1>Interclubs Manager</h1>
    <v-card>
      <v-card-title>Select the club</v-card-title>
      <v-card-text>
        <div>Start typing to filter (clubnumber or name</div>
        <v-autocomplete v-model="idclub" :items="clubs" item-text="merged" item-value="idclub"
          color="deep-purple" label="Club" clearable @change="selectclub">
          <template v-slot:item="data">
            {{ data.item.merged }}
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>
    <h2 class="mt-2">Selected club: {{ activeclub.idclub }} {{ activeclub.name_short }}
    </h2>
    <div class="elevation-2">

      <v-tabs v-model="tab" color="deep-purple" @change="updateTab">
        <v-tabs-slider color="deep-purple"></v-tabs-slider>
        <v-tab>Enrollment</v-tab>
        <v-tab>Venue</v-tab>
        <v-tab>Downloads</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item :eager="true">
          <MgmtinterclubEnrollment ref="enrollment" :club="activeclub" />
        </v-tab-item>
        <v-tab-item :eager="true">
          <MgmtinterclubVenue ref="venues" :club="activeclub" />
        </v-tab-item>
        <v-tab-item :eager="true">
          <MgmtinterclubDownloads ref="downloads" />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script>


const noop = function () { }

export default {

  name: 'Interclubs',

  layout: 'mgmt',

  data() {
    return {
      activeclub: {},
      clubs: [],
      idclub: null,
      tab: -1,
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
    title: 'Management Interclubs',
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

    async getClubs() {
      try {
        const reply = await this.$api.club.anon_get_clubs()
        this.clubs = reply.data.clubs
        this.clubs.forEach(p => {
          p.merged = `${p.idclub}: ${p.name_short} ${p.name_long}`
        })
        console.log('clubs from server', this.clubs)
      } catch (error) {
        console.error('errpr', error)
        const reply = error.response
        if (reply.status === 401) {
          this.gotoLogin()
        } else {
          console.error('Getting clubs failed', reply.data.detail)
          this.$root.$emit('snackbar', {
            text: 'Getting clubs failed'
          })
        }
      }
    },

    selectclub() {
      if (!this.idclub) {
        console.log('No idclub defined, active club becomes null')
        this.activeclub = {}
      }
      else {
        this.clubs.forEach((c) => {
          if (c.idclub == this.idclub) {
            console.log('active club found', c)
            this.activeclub = c
          }
        })
      }
      console.log('club selected', this.idclub, this.activeclub)
      this.$nextTick(()=> this.$refs.enrollment.setupEnrollment())       
    },

    updateTab(){
      console.log('updateTab', this.tab, this.$refs)
      switch (this.tab) {
        case 0:
          this.$refs.enrollment.setupEnrollment()
          break
        case 1:
          this.$refs.venues.setupVenues()
          break
      }
    }

  }

}
</script>

<style>
</style>
