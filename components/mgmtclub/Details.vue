<template>
  <v-container>
    <p v-if="!club.idclub">Select a club to view the club details</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <h2>Consulting club details</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>            
              <v-card-title class="fieldname">
                Club details
              </v-card-title>
              <v-card-text>
                <div><span class="fieldname">Long name</span>: {{ clubdetails.name_long }}
                </div>
                <div><span class="fieldname">Short name</span>: {{ clubdetails.name_short }}
                </div>
                <div><span class="fieldname">Federation</span>: {{ clubdetails.federation }}
                </div>
                <div><span class="fieldname">Website</span>: {{ clubdetails.website }}</div>              
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title>Bank details</v-card-title>
              <v-card-text>
                <div><span class="fieldname">Bank account name</span>: {{
                  clubdetails.bankaccount_name
                }}
                </div>
                <div><span class="fieldname">Bank account IBAN</span>: {{
                  clubdetails.bankaccount_iban
                }}
                </div>
                <div><span class="fieldname">Bank account BIC</span>: {{
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
                    <h4>Contact</h4>
                  </v-flex>
                  <v-flex>
                    <help-popup file="club_contact" />
                  </v-flex>
                </v-layout>
              </v-card-title>
              <v-card-text>
                <div><span class="fieldname">Main email address</span>: {{
                  clubdetails.email_main
                }}
                </div>
                <div><span class="fieldname">Email address Interclub</span>: {{
                  clubdetails.email_interclub
                }}</div>
                <div><span class="fieldname">Email address administration</span>: {{
                  clubdetails.email_admin
                }}</div>
                <div><span class="fieldname">Email address finance</span>: {{
                  clubdetails.email_finance
                }}
                </div>
                <div><span class="fieldname">Postal address</span>:<br />
                  <span v-html='clubdetails.address.replaceAll("\n", "<br />")'></span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title class="fieldname">
                Playing details
              </v-card-title>
              <v-card-text>
                <div><span class="fieldname">Club venue</span>:<br />
                  <span v-html='clubdetails.venue.replaceAll("\n", "<br />")'></span>
                </div>
                <h4>Playing hours}</h4>
                <div v-for="(h,d) in clubdetails.openinghours" :key="d">
                  <div v-show="h.length">
                    <span class="fieldname">{{ d }}</span>: {{ h }}
                  </div>
                </div>                
              </v-card-text>
            </v-card>
          </v-col> 
        </v-row>
        <v-row class="mt-2">
          <v-btn @click="modifyClub">Modify</v-btn>
        </v-row>
      </v-container>
      <v-container v-show="status_modifying">
        <h2>Modify club details</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="fieldname">
                Club details
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="clubdetails.name_long" label="Long name" />
                <v-text-field v-model="clubdetails.name_short" label="Short name" />
                <p>Federation: {{ clubdetails.federation }}</p>
                <v-text-field v-model="clubdetails.website" label="Website" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="fieldname">
                Contact
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="clubdetails.email_main" label="Main email address" />
                <v-text-field v-model="clubdetails.email_interclub" label="Email address Interclub" />
                <v-text-field v-model="clubdetails.email_admin" label="Email address administration" />
                <v-text-field v-model="clubdetails.email_finance" label="Email address finance" />
                <v-textarea rows="3" v-model="clubdetails.address" label="Postal address" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="fieldname">
                Bank details
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="clubdetails.bankacount_name" label="Bank account name" />
                <v-text-field v-model="clubdetails.bankaccount_iban" label="Bank account IBAN" />
                <v-text-field v-model="clubdetails.bankaccount_bic" label="Bank account BIC" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title class="fieldname">
                Playing details
              </v-card-title>
              <v-card-text>
                <v-textarea rows="3" v-model="clubdetails.venue" label="Club venue" />
                <h4>Playing hours</h4>
                <v-text-field v-model="clubdetails.openinghours.Monday" label="Monday" />                
                <v-text-field v-model="clubdetails.openinghours.Tuesday" label="Tuesday" />                
                <v-text-field v-model="clubdetails.openinghours.Wednesday" label="Wednesday" />                
                <v-text-field v-model="clubdetails.openinghours.Thursday" label="Thursday" />                
                <v-text-field v-model="clubdetails.openinghours.Friday" label="Friday" />                
                <v-text-field v-model="clubdetails.openinghours.Saturday" label="Saturday" />                
                <v-text-field v-model="clubdetails.openinghours.Sunday" label="Sunday" />                
              </v-card-text>
            </v-card>
          </v-col>                    
        </v-row>
        <v-row class="ma-2">
          <v-btn @click="saveClub">Save</v-btn>
          <v-btn @click="cancelClub">Cancel</v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>``
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
    logintoken() { return this.$store.state.newlogin.value },
    status_consulting() { return this.status == CLUB_STATUS.CONSULTING },
    status_modifying() { return this.status == CLUB_STATUS.MODIFYING },
  },


  methods: {

    cancelClub() {
      this.status = CLUB_STATUS.CONSULTING
      this.get_clubdetails(this.club)
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
        const reply = error.reply
        if (reply.status === 403) {
          this.$root.$emit('snackbar', { text: 'Permission denied' })
        }
        else {
          console.error('Getting club details failed', reply.data.detail)
          this.$root.$emit('snackbar', { text: 'Getting club details failed' })
        }
      }
    },


    modifyClub() {
      this.status = CLUB_STATUS.MODIFYING
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
      console.log('updates ', update)
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
        if (reply.status === 403) {
          this.$root.$emit('snackbar', { text: 'Permission denied' })
        }
        else {
          console.error('Saving enrollment', reply.data.detail)
          this.$root.$emit('snackbar', { text: this.$t('Saving club details') })
        }
      }
    },

    async setupDetails(){
      await this.get_clubdetails()
    }


  },

  mounted() {
    this.bus.$on("setupdetails", this.setupDetails)
  },

}
</script>

<style scoped>
.fieldname {
  color: purple;
}
</style>