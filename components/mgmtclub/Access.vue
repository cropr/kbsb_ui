<template>
  <v-container>
    <p v-if="!club.idclub">Select a club to view the access rights</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <h2>Consulting access rights</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title class="fieldname">Club administrators</v-card-title>
              <v-card-text>
                The club administrators have write access to the Club Manager.
                <ul>
                  <li v-for="(m, ix) in clubadmin" :key="ix">{{ m }}</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title class="fieldname">Interclub Administrators</v-card-title>
              <v-card-text>
                The interclub administrators have write access to the Interclub Manager
                <ul>
                  <li v-for="(m, ix) in interclubadmin" :key="ix">{{ m }}</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title class="fieldname">
                Interclub Captains
              </v-card-title>
              <v-card-text>
                The interclub captains have write access to the planning and 
                results of the Interclub.

                <p>Not available yet</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="ma-2">
          <v-btn @click="modifyAccess">Modify</v-btn>
        </v-row>
      </v-container>
    
      <v-container  v-show="status_modifying">
        <h2>Modify access rights</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title class="fieldname">Club administrators</v-card-title>
              <v-card-text>
                <ul>
                  <li v-for="(m, ix) in clubadmin" :key="m">
                    {{ m }} &nbsp; <v-icon @click="deleteClubAdmin(ix)">mdi-delete</v-icon>
                  </li>
                </ul>
                <v-autocomplete v-model="newclubadmin" :items="clubmemberitems" @change="addClubAdmin"
                  label="Add Member" class="memberselect">
                  <template v-slot:item="data">
                    {{ data.item.text }}
                  </template>
                </v-autocomplete>              
              </v-card-text>
            </v-card>
          </v-col>        
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title class="fieldname">Interclub Administrators</v-card-title>
              <v-card-text>
                <ul>
                  <li v-for="(m, ix) in interclubadmin" :key="m">
                    {{ m }} &nbsp; <v-icon @click="deleteInterclubAdmin(ix)">mdi-delete</v-icon>
                  </li>
                </ul>
                <v-autocomplete v-model="newinterclubadmin" :items="clubmemberitems"
                  @change="addInterclubAdmin" label="Add Member" class="memberselect">
                  <template v-slot:item="data">
                    {{ data.item.text }}
                  </template>
                </v-autocomplete>              
              </v-card-text>
            </v-card>
          </v-col>        
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card>
              <v-card-title class="fieldname">Club administrators</v-card-title>
              <v-card-text>Not available yet</v-card-text>
            </v-card>
          </v-col>        
        </v-row>
        <v-row class="ma-2">
          <v-btn @click="saveAccess">Save</v-btn>
          <v-btn @click="cancelAccess">Cancel</v-btn>
        </v-row>
      </v-container>
    </div>

  </v-container>
</template>
<script>
import Vue from 'vue'
import { visibility_items, CLUB_STATUS, ROLES } from '@/util/club'


export default {

  name: 'Access',

  data() {
    return {
      clubrights: {},
      clubadmin: {},
      clubmemberitems: [],
      interclubadmin: {},
      interclubcaptain: {},
      newclubadmin: null,
      newinterclubadmin: null,
      newinterclubcaptain: null,
      roles: ROLES,
      status: CLUB_STATUS.CONSULTING,
      visibility_items: [...visibility_items],
    }
  },

  props: {
    bus: Object,
    club: Object,
    clubmembers: Array,
  },

  computed: {
    logintoken() { return this.$store.state.newlogin.value },
    status_consulting() { return this.status == CLUB_STATUS.CONSULTING },
    status_modifying() { return this.status == CLUB_STATUS.MODIFYING },
  },

  methods: {

    addClubAdmin() {
      const cm = this.clubmembers.find(m => m.idnumber == this.newclubadmin)
      this.clubadmin[this.newclubadmin] = cm.merged
      this.$nextTick(() => this.newclubadmin = null);
    },

    addInterclubAdmin() {
      this.interclubadmin[this.newinterclubadmin] = this.clubmembers.find(
        m => m.idnumber == this.newinterclubadmin).merged
      this.$nextTick(() => this.newinterclubadmin = null);
    },

    addInterclubCaptain() {
      this.interclubcaptain[this.newinterclubcaptain] = this.clubmembers.find(
        m => m.idnumber == this.newinterclubcaptain).merged
      this.$nextTick(() => this.newinterclubcaptain = null);
    },


    cancelAccess() {
      this.status = CLUB_STATUS.CONSULTING
      this.get_clubrights(this.club)
    },

    deleteClubAdmin(m) {
      // don't delete last member
      if (Object.keys(this.clubadmin).length == 1) return
      Vue.delete(this.clubadmin, m)
    },

    deleteInterclubAdmin(m) {
      // don't delete last member
      if (Object.keys(this.interclubadmin).length == 1) return
      Vue.delete(this.interclubadmin, m)
    },

    deleteInterclubCaptain(m) {
      Vue.delete(this.interclubcaptain, m)
    },

    async get_clubrights() {
      if (!this.club.id) {
        this.clubrights = {}
        return
      }
      try {
        const reply = await this.$api.club.mgmt_get_club({
          idclub: this.club.idclub,
          token: this.logintoken
        })
        this.readClubrights(reply.data)
      } catch (error) {
        const reply = error.reply
        console.error('Getting club details failed', reply.data.detail)
        this.$root.$emit('snackbar', { text: 'Getting club details failed' })
      }
    },

    async modifyAccess() {
      this.status = CLUB_STATUS.MODIFYING
      this.clubmemberitems = this.clubmembers.map((x) => {
        return {
          value: x.idnumber,
          text: x.merged,
        }
      })
    },

    readClubrights(details) {
      details.clubroles.forEach((cr) => {
        console.log('cr', cr)
        this.clubrights[cr.nature] = cr.memberlist
      })
      this.clubadmin = Object.fromEntries(this.clubrights["ClubAdmin"].map(
        (x) => {
          const cm = this.clubmembers.find(m => m.idnumber == x)
          cm.merged = `${x} ${cm.first_name} ${cm.last_name}` 
          return [x, cm.merged]
        }
      ))
      this.interclubadmin = Object.fromEntries(this.clubrights["InterclubAdmin"].map(
        (x) => {
          const cm = this.clubmembers.find(m => m.idnumber == x)
          cm.merged = `${x} ${cm.first_name} ${cm.last_name}` 
          return [x, cm.merged]
        }
      ))
      this.interclubcaptain = Object.fromEntries(this.clubrights["InterclubCaptain"].map(
        (x) => {
          const cm = this.clubmembers.find(m => m.idnumber == x)
          cm.merged = `${x} ${cm.first_name} ${cm.last_name}` 
          return [x, cm.merged]
        }
      ))

    },

    async saveAccess() {
      try {
        const reply = await this.$api.club.mgmt_update_club({
          idclub: this.club.idclub,
          clubroles: [
            {
              nature: "ClubAdmin",
              memberlist: Object.keys(this.clubadmin)
            },
            {
              nature: "InterclubAdmin",
              memberlist: Object.keys(this.interclubadmin)
            },
            {
              nature: "InterclubCaptain",
              memberlist: Object.keys(this.interclubcaptain)
            },
          ],
          token: this.logintoken,
        })
        this.status = CLUB_STATUS.CONSULTING
        this.$root.$emit('snackbar', { text: 'Club saved' })
        this.get_clubrights()
      } catch (error) {
        const reply = error.response
        if (reply.status === 401) {
          this.gotoLogin()
        }
        else {
          console.error('Saving access rights failed', reply.data.detail)
          this.$root.$emit('snackbar', { text: 'Saving access rights failed' })
        }
      }
    },

    async setupAccess() {
      await this.get_clubrights()
    }    

  },

  mounted() {
    this.bus.$on("setupaccess", this.setupAccess)
  },

}
</script>

<style scoped>
.memberselect {
  max-width: 20em;
}
.fieldname {
  color: purple
}
</style>