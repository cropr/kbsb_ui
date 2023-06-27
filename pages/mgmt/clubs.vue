<template>
  <v-container>
    <h1>Club Manager</h1>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="4">
            <v-btn>Create new club</v-btn><br />
            <v-btn class="mt-2">Make a mailing</v-btn>
          </v-col>
          <v-col cols="8">
            <v-btn>Export list of clubs</v-btn>
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

      <v-tabs v-model="tab" color="deep-purple" @change="call_childmethods">
        <v-tabs-slider color="deep-purple"></v-tabs-slider>
        <v-tab>Club details</v-tab>
        <v-tab>Access rights</v-tab>
        <!-- <v-tab>Downloads</v-tab> -->
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <MgmtclubDetails @interface="registerChildMethod" :club="activeclub" />
        </v-tab-item>
        <v-tab-item>
          <MgmtclubAccess @interface="registerChildMethod" :club="activeclub" />
        </v-tab-item>
        <!-- <v-tab-item>
          <MgmtclubDownloads />
        </v-tab-item> -->
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script>
import { EMPTY_CLUB } from '@/util/cms'
const noop = function () { }

export default {

  name: 'Club',

  layout: 'mgmt',

  data() {
    return {
      activeclub: {},
      childmethods: {
        get_clubdetails: noop,
        get_clubrights: noop,
      },
      clubs: [],
      idclub: null,
      tab: null,
      exportformat: "JSON",
      exportformats: [
        "JSON",
        "CSV",
        "Excel",
      ],
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
    this.getClubs()
  },

  methods: {


    call_childmethods() {
      Object.keys(this.childmethods).forEach((v) => {
        this.childmethods[v]()
      })
    },

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
      console.log('getClubs')
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

    registerChildMethod(methodname, method) {
      this.childmethods[methodname] = method
    },

    selectclub() {
      if (!this.idclub) {
        this.activeclub = {}
      }
      else {
        this.clubs.forEach((c) => {
          if (c.idclub == this.idclub) {
            this.activeclub = { ...EMPTY_CLUB, ...c }
          }
        })
      }
      this.$nextTick(() => this.call_childmethods())
    }

  }

}
</script>

<style></style>
