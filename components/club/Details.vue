<template>
  <v-container>
    <p v-if="!club.idclub">{{ $t('Select a club to view the club details') }}</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <h2>{{ $t('Consulting club details') }}</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>            
              <v-card-title>
                {{ $t('Club details') }}
              </v-card-title>
              <v-card-text>
                <div><span class="fieldname">{{ $t('Long name') }}</span>: {{ clubdetails.name_long }}
                </div>
                <div><span class="fieldname">{{ $t('Short name') }}</span>: {{ clubdetails.name_short }}
                </div>
                <div><span class="fieldname">{{ $t('Federation') }}</span>: {{ clubdetails.federation }}
                </div>
                <div><span class="fieldname">{{ $t('Website') }}</span>: {{ clubdetails.website }}</div>              
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>{{ $t('Bank details') }}</v-card-title>
              <v-card-text>
                <div><span class="fieldname">{{ $t('Bank account name') }}</span>: {{
                  clubdetails.bankaccount_name
                }}
                </div>
                <div><span class="fieldname">{{ $t('Bank account IBAN') }}</span>: {{
                  clubdetails.bankaccount_iban
                }}
                </div>
                <div><span class="fieldname">{{ $t('Bank account BIC') }}</span>: {{
                  clubdetails.bankaccount_bic
                }}
                </div>              
              </v-card-text>
            </v-card>
          </v-col>                      
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>
                <v-layout class="mt-2">
                  <v-flex grow>
                    <h4>{{ $t('Contact') }}</h4>
                  </v-flex>
                  <v-flex>
                    <help-popup file="club_contact" />
                  </v-flex>
                </v-layout>
              </v-card-title>
              <v-card-text>
                <div><span class="fieldname">{{ $t('Main email address') }}</span>: {{
                  clubdetails.email_main
                }}
                </div>
                <div><span class="fieldname">{{ $t('Email address Interclub') }}</span>: {{
                  clubdetails.email_interclub
                }}</div>
                <div><span class="fieldname">{{ $t('Email address administration') }}</span>: {{
                  clubdetails.email_admin
                }}</div>
                <div><span class="fieldname">{{ $t('Email address finance') }}</span>: {{
                  clubdetails.email_finance
                }}
                </div>
                <div><span class="fieldname">{{ $t('Postal address') }}</span>:<br />
                  <span v-html='clubdetails.address.replaceAll("\n", "<br />")'></span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>
                {{ $t('Playing details') }}
              </v-card-title>
              <v-card-text>
                <div><span class="fieldname">{{ $t('Club venue') }}</span>:<br />
                  <span v-html='clubdetails.venue.replaceAll("\n", "<br />")'></span>
                </div>
                <h4>{{ $t('Playing hours') }}</h4>
                <div v-for="(h,d) in clubdetails.openinghours" :key="d">
                  <div v-show="h.length">
                    <span class="fieldname">{{ $t(d)  }}</span>: {{ h }}
                  </div>
                </div>                
              </v-card-text>
            </v-card>
          </v-col> 
        </v-row>
        <v-row class="mt-2">
          <v-btn @click="modifyClub">{{ $t('Modify') }}</v-btn>
        </v-row>
      </v-container>
      <v-container v-show="status_modifying">
        <h2>{{ $t('Modify club details') }}</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title>
                {{ $t('Club details') }}
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="clubdetails.name_long" :label="$t('Long name')" />
                <v-text-field v-model="clubdetails.name_short" :label="$t('Short name')" />
                <p>{{ $t('Federation') }}: {{ clubdetails.federation }}</p>
                <v-text-field v-model="clubdetails.website" label="Website" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title>
                {{ $t('Contact') }}
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="clubdetails.email_main" :label="$t('Main email address')" />
                <v-text-field v-model="clubdetails.email_interclub" :label="$t('Email address Interclub')" />
                <v-text-field v-model="clubdetails.email_admin" :label="$t('Email address administration')" />
                <v-text-field v-model="clubdetails.email_finance" :label="$t('Email address finance')" />
                <v-textarea rows="3" v-model="clubdetails.address" :label="$t('Postal address')" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title>
                {{ $t('Bank details') }}
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="clubdetails.bankacount_name" :label="$t('Bank account name')" />
                <v-text-field v-model="clubdetails.bankaccount_iban" :label="$t('Bank account IBAN')" />
                <v-text-field v-model="clubdetails.bankaccount_bic" :label="$t('Bank account BIC')" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>
                {{ $t('Playing details') }}
              </v-card-title>
              <v-card-text>
                <v-textarea rows="3" v-model="clubdetails.venue" :label="$t('Club venue')" />
                <h4>{{ $t('Playing hours') }}</h4>
                <v-text-field v-model="clubdetails.openinghours.Monday" :label="$t('Monday')" />                
                <v-text-field v-model="clubdetails.openinghours.Tuesday" :label="$t('Tuesday')" />                
                <v-text-field v-model="clubdetails.openinghours.Wednesday" :label="$t('Wednesday')" />                
                <v-text-field v-model="clubdetails.openinghours.Thursday" :label="$t('Thursday')" />                
                <v-text-field v-model="clubdetails.openinghours.Friday" :label="$t('Friday')" />                
                <v-text-field v-model="clubdetails.openinghours.Saturday" :label="$t('Saturday')" />                
                <v-text-field v-model="clubdetails.openinghours.Sunday" :label="$t('Sunday')" />                
              </v-card-text>
            </v-card>
          </v-col>                    
        </v-row>
        <v-row class="ma-2">
          <v-btn @click="saveClub">{{ $t('Save') }}</v-btn>
          <v-btn @click="cancelClub">{{ $t('Cancel') }}</v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>
<script>

import { CLUB_STATUS, EMPTY_CLUB } from '@/util/club'

export default {

  name: 'Details',

  data() {
    return {
      clubmembers: {},
      clubdetails: EMPTY_CLUB,
      copyclubdetails: null,
      mbr_items: [],
      status: CLUB_STATUS.CONSULTING,
    }
  },

  props: {
    bus: Object,
    club: Object,
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

    async setupDetails(){
      await this.get_clubdetails()
    }

  },

  async mounted() {
    this.bus.$on("setupdetails", this.setupDetails)
  },

}
</script>

<style scoped>
.fieldname {
  color: green;
}
</style>
