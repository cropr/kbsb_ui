<template>
  <v-container>
    <h1>Interclubs Manager</h1>
    <v-card>
      <v-card-title>
        {{ $t('Select the club') }}
      </v-card-title>
      <v-card-text>
        <div>{{ $t('Start typing to filter (clubnumber or name)') }}</div>
        <v-autocomplete v-model="idclub" :items="clubs" item-text="merged" item-value="idclub"
          color="green" label="Club" clearable @change="selectclub">
          <template v-slot:item="data">
            {{ data.item.merged }}
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>
    <h2 class="mt-2">{{ $t('Selected club') }}: {{ activeclub.idclub }} {{ activeclub.name_short }}
    </h2>
    <div class="elevation-2">

      <v-tabs v-model="tab" color="green" @change="call_childmethods">
        <v-tabs-slider color="green"></v-tabs-slider>
        <v-tab>{{ $t('Enrollment') }}</v-tab>
        <v-tab>{{ $t('Venue') }}</v-tab>
        <v-tab>{{ $t('Player list') }}</v-tab>
        <v-tab>{{ $t('Planning') }}</v-tab>
        <v-tab>{{ $t('Results') }}</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <InterclubEnrollment @interface="registerChildMethod" :club="activeclub" />
        </v-tab-item>
        <v-tab-item>
          <InterclubVenue @interface="registerChildMethod" :club="activeclub" />
        </v-tab-item>
        <v-tab-item>
          <InterclubPlayerlist @interface="registerChildMethod" :club="activeclub" />
        </v-tab-item>
        <v-tab-item>
          <InterclubPlanning @interface="registerChildMethod" :club="activeclub" />
        </v-tab-item>
        <v-tab-item>
          <InterclubResult @interface="registerChildMethod" :club="activeclub" />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script>
import TheCarouselVue from '../../components/TheCarousel.vue'


const noop = function () { }

export default {

  name: 'Interclub',

  layout: 'default',

  data() {
    return {
      activeclub: {},
      childmethods: {
        find_interclubenrollment: noop,
        find_interclubvenues: noop,
      },
      clubs: [],
      idclub: null,
      tab: null,
    }
  },

  computed: {
    logintoken() { return this.$store.state.oldlogin.value },
  },

  mounted() {
    this.$store.commit('oldlogin/startup')
    if (!this.logintoken.length) {
      this.gotoLogin()
    }
    this.getClubs()
  },

  methods: {

    call_childmethods() {
      Object.keys(this.childmethods).forEach((v) => {
        this.childmethods[v]()
      })
    },

    async getClubs() {
      try {
        const reply = await this.$api.club.clb_get_clubs({
          token: this.logintoken
        })
        this.clubs = reply.data.clubs
        this.clubs.forEach(p => {
          p.merged = `${p.idclub}: ${p.name_short} ${p.name_long}`
        })
        console.log('clubs from server', this.clubs)
      } catch (error) {
        const reply = error.response
        console.error('getting clb_get_clubs', reply)
        if (reply.status === 401) {
          this.gotoLogin()
        } else {
          console.error('Getting clubs failed', reply.data.detail)
          this.$root.$emit('snackbar', { text: this.$t('Getting clubs failed') })
        }
      }
    },



    gotoLogin() {
      this.$router.push('/tools/oldlogin?url=__tools__interclub')
    },

    registerChildMethod(methodname, method) {
      this.childmethods[methodname] = method
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
      this.$nextTick(() => this.call_childmethods())
    }

  }

}
</script>

<style>
</style>
