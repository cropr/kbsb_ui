<template>
  <v-container>
    <p v-if="!club.idclub">Please select a club to view the club details</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <h3>Consulting club details</h3>
        <v-row >
          <v-col cols="12" md="6">
            <h4>Club details</h4>
            <div><span class="fieldname">Long name</span>: {{ clubdetails.name_long }}</div>
            <div><span class="fieldname">Short name</span>: {{ clubdetails.name_short }}</div>
            <div><span class="fieldname">Federation</span>: {{ clubdetails.federation }}</div>
            <div><span class="fieldname">Club Venue</span>:<br />
              <span v-html='clubdetails.venue.replace("\n", "<br />")'></span>
            </div>
            <div><span class="fieldname">Website</span>: {{ clubdetails.website }}</div>
            <div><span class="fieldname">Bank account name</span>: {{ clubdetails.bankaccount_name
            }}
            </div>
            <div><span class="fieldname">Bank account IBAN</span>: {{ clubdetails.bankaccount_iban
            }}
            </div>
            <div><span class="fieldname">Bank account BIC</span>: {{ clubdetails.bankaccount_bic }}
            </div>
            <h4 class="mt-2">Contact</h4>
            <div><span class="fieldname">Main email address</span>: {{ clubdetails.email_main }}
            </div>
            <div><span class="fieldname">Email address Interclub</span>: {{
              clubdetails.email_intercLub
            }}</div>
            <div><span class="fieldname">Email address administration</span>: {{
              clubdetails.email_admin
            }}</div>
            <div><span class="fieldname">Email address finance</span>: {{ clubdetails.email_finance
            }}
            </div>
            <div><span class="fieldname">Postal address</span>:<br />
              <span v-html='clubdetails.address.replace("\n", "<br />")'></span>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <h4>Board Members</h4>
            <ul>
              <li v-for="(bm, f) in clubdetails.boardmembers" :key="f">
                <span class="fieldname">{{ boardroles[f][$i18n.locale] }}</span>:
                {{ bm.first_name }} {{ bm.last_name }}<br />
                email: {{ bm.email }}<br />
                gsm: {{ bm.mobile }}
              </li>
            </ul>
          </v-col>
        </v-row>
        <v-row v-show="status_consulting">
          <v-btn @click="modifyClub">Modify club</v-btn>
        </v-row>
      </v-container>
      <v-container v-show="status_modifying">
        <h3>Modify club details</h3> 
        <v-row class="my-2">
          <v-col cols="12" md="6">
            <h4>Club details</h4>
            <v-text-field v-model="clubdetails.name_long" label="Long name" />
            <v-text-field v-model="clubdetails.name_short" label="Short name" />
            <v-text-field v-model="clubdetails.federation" label="Federation (V/F/D)" />
            <v-textarea v-model="clubdetails.venue" label="Venue" />
            <v-text-field v-model="clubdetails.website" label="Website" />
          </v-col>
          <v-col cols="12" md="6">
            <h4>Contact</h4>
            <v-text-field v-model="clubdetails.email_main" label="Main E-mail address" />
            <v-text-field v-model="clubdetails.email_interclub" label="E-mail Interclub" />
            <v-text-field v-model="clubdetails.email_admin" label="E-mail administration" />
            <v-text-field v-model="clubdetails.email_finance" label="E-mail finance" />
            <v-textarea v-model="clubdetails.address" label="Postal address" />
          </v-col>

          <v-col cols="12" md="6">
            <h4>Bank details</h4>Pressesprecher
            <v-text-field v-model="clubdetails.bankacount_name" label="Name bank account" />
            <v-text-field v-model="clubdetails.bankaccount_iban" label="IBAN bank account" />
            <v-text-field v-model="clubdetails.bankaccount_bic" label="BIC bank account" />
          </v-col>
        </v-row>
        <h4>Board Members</h4>
        <v-row class="my-2">
            <v-col cols="12" sm="6" lg="4" v-for="(bm, f) in boardmembers" :key="f">
              <v-card class="elevation-5">
                <v-card-title class="fieldname"> {{ f }}</v-card-title>
                <v-card-text>
                  <v-autocomplete v-model="boardmembers[f].idnumber" :items="mbr_items" :label="boardroles[f][$i18n.locale]"
                    item-text="merged" item-value="idnumber" color="deep-purple" clearable @change="updateboard(f)">
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
        <v-row class="ma-3">
          <v-btn @click="saveClub">Save club</v-btn>
          <v-btn @click="cancelClub">Cancel</v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>``
<script>

import { boardroles, visibility_items, CLUB_STATUS, EMPTY_BOARD, EMPTY_CLUB } from '@/util/club'


export default {

  name: 'Details',

  data() {
    return {
      boardroles: boardroles,
      boardmembers: EMPTY_BOARD,
      clubmembers: {},
      clubdetails: EMPTY_CLUB,
      copyclubdetails: null,
      mbr_items: [],
      status: CLUB_STATUS.CONSULTING,
      visibility_items: visibility_items
    }
  },

  props: {
    club: Object
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

    emitInterface() {
      this.$emit("interface", "get_clubdetails", this.get_clubdetails);
    },

    async get_clubmembers() {
      try {
        const reply = await this.$api.old.get_clubmembers({
          idclub: this.club.idclub,
        })
        const activemembers = reply.data.activemembers
        activemembers.forEach(p => {
          p.merged = `${p.idnumber}: ${p.first_name} ${p.last_name}`
        })
        this.mbr_items = Object.values(activemembers.sort((a, b) =>
          (a.last_name > b.last_name ? 1 : -1)))
        this.clubmembers = Object.fromEntries(this.mbr_items.map(x => [x.idnumber, x]))
      } catch (error) {
        const reply = error.reply
        if (reply.status === 401) {
          this.gotoLogin()
        }
        else {
          console.error('Getting club members failed', reply.data.detail)
          this.$root.$emit('snackbar', { text: 'Getting club members failed' })
        }
      }
    },

    async get_clubdetails() {
      console.log("getting club details", this.club)
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
        if (reply.status === 401) {
          this.gotoLogin()
        }
        else {
          console.error('Getting club details failed', reply.data.detail)
          this.$root.$emit('snackbar', { text: 'Getting club details failed' })
        }
      }
    },


    modifyClub() {
      this.status = CLUB_STATUS.MODIFYING
      this.get_clubmembers();
    },

    readClubdetails(details) {
      this.clubdetails = { ...EMPTY_CLUB, ...details }
      this.copyclubdetails = JSON.parse(JSON.stringify(details))
      this.boardmembers = { ...EMPTY_BOARD, ...details.boardmembers }
    },

    async saveClub() {
      console.log('saving', this.clubdetails)
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
        if (reply.status === 401) {
          this.gotoLogin()
        }
        else {
          console.error('Saving enrollment', reply.data.detail)
          this.$root.$emit('snackbar', { text: this.$t('Saving club details') })
        }
      }
    },

    updateboard(f) {
      const bm = this.boardmembers[f]
      if (bm.idnumber) {
        let cm = this.clubmembers[bm.idnumber]
        bm.first_name = cm.first_name
        bm.last_name = cm.last_name
        bm.email = cm.email
        bm.mobile = cm.mobile
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
    this.emitInterface();
  },

}
</script>

<style scoped>
.fieldname {
  color: purple;
}
</style>