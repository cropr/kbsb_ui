<template>
  <v-container>
    <p v-if="!club.idclub">{{ $t('Select a club to view the club details') }}</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <h3>{{ $t('Consulting club details') }}</h3>
        <v-row>
          <v-col cols="12" md="6">
            <h4>{{ $t('Club details') }}</h4>
            <div><span class="fieldname">{{ $t('Long name') }}</span>: {{ clubdetails.name_long }}
            </div>
            <div><span class="fieldname">{{ $t('Short name') }}</span>: {{ clubdetails.name_short }}
            </div>
            <div><span class="fieldname">{{ $t('Federation') }}</span>: {{ clubdetails.federation }}
            </div>
            <div><span class="fieldname">{{ $t('Club venue') }}</span>:<br />
              <span v-html='clubdetails.venue.replaceAll("\n", "<br />")'></span>
            </div>
            <div><span class="fieldname">{{ $t('Website') }}</span>: {{ clubdetails.website }}</div>
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
            <v-layout class="mt-2">
              <v-flex grow>
                <h4>{{ $t('Contact') }}</h4>
              </v-flex>
              <v-flex>
                <help-popup file="club_contact" />
              </v-flex>
            </v-layout>
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
          </v-col>
          <v-col cols="12" sm="6" lg="4">
            <h4>{{ $t('Board members') }}</h4>
            <ul>
              <li v-for="(bm, f) in clubdetails.boardmembers" :key="f">
                <tr-fieldname :fieldname="f" />: {{ bm.first_name }} {{ bm.last_name }}<br />
                email: {{ bm.email }}<br />
                gsm: {{ bm.mobile }}
              </li>
            </ul>
          </v-col>
        </v-row>
        <v-row class="mt-2">
          <v-btn @click="modifyClub">{{ $t('Modify club') }}</v-btn>
        </v-row>
      </v-container>
      <v-container v-show="status_modifying">
        <h3 >{{ $t('Modify club') }}</h3>
        <v-row>
          <v-col cols="12" md="6" lg="4">
            <h4>{{ $t('Club details') }}</h4>
            <v-text-field v-model="clubdetails.name_long" :label=" $t('Long name')" />
            <v-text-field v-model="clubdetails.name_short" :label="$t('Short name')" />
            <p>{{ $t('Federation') }}: {{ clubdetails.federation }}</p>
            <v-textarea rows="3" v-model="clubdetails.venue" :label="$t('Venue')" />
            <v-text-field v-model="clubdetails.website" label="Website" />
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <h4>{{ $t('Contact') }}</h4>
            <v-text-field v-model="clubdetails.email_main" :label="$t('Main email address')" />
            <v-text-field v-model="clubdetails.email_interclub" :label="$t('Email address Interclub')" />
            <v-text-field v-model="clubdetails.email_admin" :label="$t('Email address administration')" />
            <v-text-field v-model="clubdetails.email_finance" :label="$t('Email address finance')" />
            <v-textarea  rows="3"v-model="clubdetails.address" :label="$t('Postal address')" />
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <h4>{{ $t('Bank details') }}</h4>
            <v-text-field v-model="clubdetails.bankacount_name" :label="$t('Bank account name')" />
            <v-text-field v-model="clubdetails.bankaccount_iban" :label="$t('Bank account IBAN')" />
            <v-text-field v-model="clubdetails.bankaccount_bic" :label="$t('Bank account BIC')" />
          </v-col>
        </v-row>
        <h4>{{ $t('Board members') }}</h4>
        <v-row >
          <v-col cols="12" sm="6" lg="4" v-for="(bm, f) in clubdetails.boardmembers" :key="f">
            <v-card class="elevation-5">
              <v-card-title>                
                <tr-fieldname :fieldname="f" />
              </v-card-title>
              <v-card-text>
                <v-autocomplete v-model="boardmembers[f].idnumber" :items="mbr_items" 
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
        <v-row class="ma-2">
          <v-btn @click="saveClub">{{ $t('Save club') }}</v-btn>
          <v-btn @click="cancelClub">{{ $t('Cancel') }}</v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>
<script>

import { EMPTY_CLUB } from '@/util/cms'
import { boardroles, visibility_items, CLUB_STATUS, EMPTY_BOARD } from '@/util/club'

export default {

  name: 'Details',

  data() {
    return {
      boardmembers: EMPTY_BOARD,
      boardroles: boardroles,
      clubmembers: {},
      clubdetails: EMPTY_CLUB,
      copyclubdetails: null,
      mbr_items: [],
      status: CLUB_STATUS.CONSULTING,
      visibility_items: [...visibility_items]
    }
  },

  props: {
    club: Object
  },

  computed: {
    logintoken() { return this.$store.state.oldlogin.value },
    status_consulting() { return this.status == CLUB_STATUS.CONSULTING },
    status_modifying() { return this.status == CLUB_STATUS.MODIFYING },
  },

  async fetch() {
      this.boardroles = (await this.$content('boardroles').fetch()).boardroles
    },

  methods: {

    cancelClub() {
      this.status = CLUB_STATUS.CONSULTING
      this.get_clubdetails()
    },

    emitInterface() {
      this.$emit("interface", "get_clubdetails", this.get_clubdetails);
    },

    async get_clubmembers() {
      try {
        console.log("getting clubmembers")
        const reply = await this.$api.old.get_clubmembers({
          idclub: this.club.idclub,
        })
        console.log("getting clubmembers OK")
        const activemembers = reply.data.activemembers
        activemembers.forEach(p => {
          p.merged = `${p.idnumber}: ${p.first_name} ${p.last_name}`
        })
        this.mbr_items = Object.values(activemembers.sort((a, b) =>
          (a.last_name > b.last_name ? 1 : -1)))
        this.clubmembers = Object.fromEntries(this.mbr_items.map(x => [x.idnumber, x]))
      } catch (error) {
        console.log("getting clubmembers NOK")
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
            this.$root.$emit('snackbar', { text: this.$t('Getting club members failed') })
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
        const reply = await this.$api.club.clb_get_club({
          idclub: this.club.idclub,
          token: this.logintoken
        })
        console.log("getting club details OK", reply.data)
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
        this.get_clubmembers();
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
      console.log('saving', this.clubdetails,)
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

  async mounted() {
    this.emitInterface();
    this.visibility_items.forEach((vi)=>{
      console.log('vi', vi)
      if (!vi.translated) {
        vi.text = this.$t(vi.text)
        vi.translated = true
      }
    })
  },

}
</script>

<style scoped>
.fieldname {
  color: green;
}
</style>
