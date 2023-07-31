<template>
  <v-container>
    <p v-if="!club.idclub">Please select a club to view the enrollment</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <v-row v-show="!enrollment.id">
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Enrollment
              </v-card-title>
              <v-card-text>
                The club is not enrolled yet
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-show="enrollment.id">
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                {{ $t("Teams") }}
              </v-card-title>
              <v-card-text>
                <ul>
                  <li><span class="fieldname">Teams in division 1:</span> {{ enrollment.teams1 }}</li>
                  <li><span class="fieldname">Teams in division 2:</span> {{ enrollment.teams2 }}</li>
                  <li><span class="fieldname">Teams in division 3:</span> {{ enrollment.teams3 }}</li>
                  <li><span class="fieldname">Teams in division 4:</span> {{ enrollment.teams4 }}</li>
                  <li>T<span class="fieldname">Teams in division 5:</span> {{ enrollment.teams5 }}</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                {{ $t("Wishes") }}
              </v-card-title>
              <v-card-text>
                <ul>
                  <li><span class="fieldname">Teams grouped by pairing number:</span> {{ groupingvalue }} </li>
                  <li><span class="fieldname">Distribution of teams in same division:</span> {{ splittingvalue }} </li>
                  <li><span class="fieldname">Regional preferences:</span> {{ enrollment.wishes.regional }} </li>
                  <li><span class="fieldname">Remarks:</span> {{ enrollment.wishes.remarks }} </li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Name
              </v-card-title>
              <v-card-text>
                <span class="fieldname">Name of the club</span>, as shown in results and pairings: {{ enrollment.name }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="modifyEnrollment">
            Edit
          </v-btn>
        </v-row>
      </v-container>
      <v-container v-show="status_modifying">
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Teams
              </v-card-title>
              <v-card-text>
                <p>Number of teams per division</p>
                <v-text-field v-model="enrollment.teams1" label="division 1"
                  type="number" min="0" max="1" />
                <v-text-field v-model="enrollment.teams2" label="division 2"
                  type="number" min="0" max="15" />
                <v-text-field v-model="enrollment.teams3" label="division 3"
                  type="number" min="0" max="15" />
                <v-text-field v-model="enrollment.teams4" label="division 4"
                  type="number" min="0" max="15" />
                <v-text-field v-model="enrollment.teams5" label="division 5"
                  type="number" min="0" max="15" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Wishes
              </v-card-title>
              <v-card-text>
                <div>Teams grouped by pairing number</div>
                <v-select label="Grouping"
                  v-model="enrollment.wishes.grouping" :items="grouping" />
                <div>Distribution of teams in same division</div>  
                <v-select :label="Distribution"
                  v-model="enrollment.wishes.split" :items="splitting" />
                <v-text-field v-model="enrollment.wishes.regional"
                  label="Regional preferences" /> 
                <v-textarea rows="5" v-model="enrollment.wishes.remarks" label="Other wishes" />
              </v-card-text>                                                     
            </v-card>            
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Name
              </v-card-title>
              <v-card-text>
                You can define a name for your club when the results and standings are displayed.
                As a default, you clubname is used.
                <v-text-field v-model="enrollment.name" label="Name" />
              </v-card-text>                                                     
            </v-card>            
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="saveEnrollment">
            Save
          </v-btn>&nbsp;
          <v-btn @click="cancelEnrollment">
            Cancel
          </v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>
<script>
import { INTERCLUBS_STATUS, empty_enrollment } from '@/util/interclubs.js'

export default {

  name: 'Enrollment',

  data() {
    return {
      grouping: [
        { "text": "No preference", "value": "0" },
        { "text": "1 group", "value": "1" },
        { "text": "2 opposite groups", "value": "2" },
      ],
      splitting: [
        { "text": "In 1 series", "value": "1" },
        { "text": "In multiple series", "value": "2" },
      ],
      enrollment: empty_enrollment,
      status: INTERCLUBS_STATUS.CONSULTING,
    }
  },

  props: {
    club: Object
  },

  computed: {
    logintoken() { return this.$store.state.newlogin.value },
    groupingvalue() {
      const gr = this.grouping.filter(x => x.value == this.enrollment.wishes.grouping)
      return gr.length > 0 ? gr[0].text : ""
    },
    splittingvalue() {
      const spl = this.splitting.filter(x => x.value == this.enrollment.wishes.split)
      return spl.length > 0 ? spl[0].text : ""
    },
    status_consulting() { return this.status == INTERCLUBS_STATUS.CONSULTING },
    status_modifying() { return this.status == INTERCLUBS_STATUS.MODIFYING },
  },

  methods: {

    cancelEnrollment() {
      this.status = INTERCLUBS_STATUS.CONSULTING
      this.find_interclubenrollment()
    },

    async find_interclubenrollment() {
      console.log('find interclub enrollment', this.club.id, this.club.idclub)
      if (!this.club.id) {
        this.enrollment = empty_enrollment
        return
      }
      this.enrollment = { ... empty_enrollment}
      try {
        const reply = await this.$api.interclub.find_interclubenrollment({
          idclub: this.club.idclub
        })
        if (reply.data) {
          this.enrollment = reply.data
        }
        else {
          this.enrollment.id = null
        }
      } catch (error) {
        const reply = error.response
        if (reply.status === 401) {
          this.gotoLogin()
        }
        else {
          console.error('Getting existing enrollment failed', reply.data.detail)
          this.$root.$emit('snackbar', { text: 'Getting existing enrollment failed' })
        }
      }
    },

    async modifyEnrollment() {
      this.status = INTERCLUBS_STATUS.MODIFYING
      this.enrollment.name = this.club.name_short
    },

    async saveEnrollment() {
      try {
        const reply1 = await this.$api.interclub.mgmt_set_interclubenrollment({
          token: this.logintoken,
          idclub: this.club.idclub,
          name: this.enrollment.name,
          teams1: this.enrollment.teams1,
          teams2: this.enrollment.teams2,
          teams3: this.enrollment.teams3,
          teams4: this.enrollment.teams4,
          teams5: this.enrollment.teams5,
          wishes: this.enrollment.wishes,
        })
        this.status = INTERCLUBS_STATUS.CONSULTING
        this.find_interclubenrollment(this.club)
      } catch (error) {
        const reply = error.response
        console.error('Saving enrollment', reply.data.detail)
        this.$root.$emit('snackbar', { text: 'Saving enrollment' })
      }
    },

    async setupEnrollment(){
      console.log('setting up Enrollment')
      await this.find_interclubenrollment()
    },

  },



}
</script>

<style scoped?>
.fieldname {
  color: purple
}
</style>